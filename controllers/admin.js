
//middleware
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
//model
const User = require('../models/User');


//@desc     Get all users
//@route    GET /api/v1/admin/users
//@access   Private - must have 'super' role
exports.getAllUsers = asyncHandler(async (req, res, next) => {
    if(req.user.role !== 'super'){
        return next(new ErrorResponse(`Not authorized for this route`, 401));
    }

    let users = await User.find();

    res.status(200).json({
        success: true,
        data: users
    });
 });