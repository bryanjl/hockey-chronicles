
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

//@desc     Set user Role
//@route    PUT /api/v1/admin/users/:id
//@access   Private - must have 'super' role
exports.updateUserRole = asyncHandler(async (req, res, next) => {
    if(req.user.role !== 'super'){
        return next(new ErrorResponse(`Not authorized for this route`, 401));
    }

    let user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});

    res.status(200).json({
        success: true,
        data: user
    });
 });

//@desc     Delete a user
//@route    DELETE /api/v1/admin/users/:id
//@access   Private - must have 'super' role
exports.deleteUser = asyncHandler(async (req, res, next) => {
    if(req.user.role !== 'super'){
        return next(new ErrorResponse(`Not authorized for this route`, 401));
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
    });
 });