const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
// const {sendEmail} = require('../utils/sendEmail');
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(`${process.env.SENDGRID_API_KEY}`);
const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');

const transport = nodemailer.createTransport(
    nodemailerSendgrid({
        apiKey: process.env.SENDGRID_API_KEY
    })
);


//@desc     Register a user
//@route    POST /api/v1/auth/register
//@access   Public
exports.register = asyncHandler(async (req, res, next) => {
    // const { username, email, password, role } = req.body;

    req.body.profileImageFile = req.body.imageFile;

    //create User
    const user = await User.create(req.body);
    //send token
    sendTokenResponse(user, 200, res);
 });

//@desc     Login a user
//@route    POST /api/v1/auth/login
//@access   Public
exports.login = asyncHandler(async (req, res, next) => {
    const { username, password } = req.body;

    //validate the email and password
    if(!username || !password){
        return next(new ErrorResponse(`Please provide an username and password`, 400))
    }

    //check for user
    const user = await User.findOne({ username }).select('+password');

    if(!user) {
        return next(new ErrorResponse(`Cannot Find User`, 404));
    }

    //check password
    const isMatch = await user.matchPassword(password);
    if(!isMatch) {
        return next(new ErrorResponse('Invalid Password', 401));
    }

    //send token
    sendTokenResponse(user, 200, res);
 });

//@desc     Logout the User / clear cookie
//@route    GET /api/v1/auth/logout
//@access   Private
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res
        .status(200)
        .json({
            success: true,
            data: {}
        });
}); 

//@desc     Get current logged in user
//@route    GET /api/v1/auth/me
//@access   Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res
        .status(200)
        .json({
            success: true,
            data: user
        });
});  

//@desc     Update user details
//@route    GET /api/v1/auth/updatedetails
//@access   Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        username: req.body.username,
        email: req.body.email,
        profileImageFile: req.body.imageFile
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res
        .status(200)
        .json({
            success: true,
            data: user
        });
}); 

//@desc     Update password
//@route    PUT /api/v1/auth/updatepassword
//@access   Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if(!(await user.matchPassword(req.body.currentPassword))){
        return next(new ErrorResponse(`Incorrect Password`, 400));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
}); 

//@desc     Forgot password
//@route    POST /api/v1/auth/forgotpassword
//@access   Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email});

    if(!user) {
        return next(new ErrorResponse(`Incorrect Email`, 404));
    }

    //get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // create reset url
    const resetUrl = `https://hockey-chronicles-r3lzq.ondigitalocean.app/resetpassword/${resetToken}`;

    //create message
    const message = `You are recieving this email because you (or someone else) has requested the reset of a password.  Please visit: ${resetUrl} to change your password`;

    let resetEmail = {
        from: 'bryanjameslilly@gmail.com',
        to: `${user.email}`,
        subject: 'Hockey Fight Chronicles Password Reset',
        text: `${message}`,
        
    }

    try {
        
        transport.sendMail(resetEmail, () => {
            res.status(200).json({
                success: true,
                data: 'Email sent'
            })
        })

        // sgMail.send(resetEmail).then(() => {
        //     res.status(200).json({
        //         success: true,
        //         data: 'Email sent'
        //     })}
        //     ).catch((error) => {
        //         throw new Error('cannot send email');
        //     })
        


    } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse(`Email could not be sent`, 500));
    }
});  

//@desc     Reset Password
//@route    PUT /api/v1/auth/resetpassword/:resettoken
//@access   Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    //get hashed token
    const resetPasswordToken = crypto  
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');    
    
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if(!user){
        return next(new ErrorResponse(`Invalid Token`, 400));
    }

    //set new password and clear reset token
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
}); 

//get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    //create token
    const token = user.getSignedJwtToken();

    const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000), //30days,
    httpOnly: true
    };

    //if in production mode make secure
    if(process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    let userObj = user.toObject();
    delete userObj.password;

    res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
        success: true,
        user: userObj,
        token
    });
}
