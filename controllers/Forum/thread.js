const ErrorResponse = require('../../utils/ErrorResponse');
const asyncHandler = require('../../middleware/async');

const Thread = require('../../models/Forum/Thread');

//@desc     Get thread by ID
//@route    GET /api/v1/forum/threads/[id]
//@access   Public
exports.getThread = asyncHandler(async (req, res, next) =>{
    res.status(200).json({
        success: true,
        data: 'Get thread by ID route'
    })
});

//@desc     Create thread
//@route    POST /api/v1/forum/threads
//@access   Private
exports.createThread = asyncHandler(async (req, res, next) =>{
    res.status(200).json({
        success: true,
        data: 'Create a thread route'
    })
});

//@desc     Update a thread
//@route    PUT /api/v1/forum/threads/[id]
//@access   Private
exports.updateThread = asyncHandler(async (req, res, next) =>{
    res.status(200).json({
        success: true,
        data: 'Update a thread Route'
    })
});

//@desc     Delete a thread
//@route    DELETE /api/v1/forum/threads/[id]
//@access   Private
exports.deleteThread = asyncHandler(async (req, res, next) =>{
    res.status(200).json({
        success: true,
        data: 'delete a thread route'
    })
});