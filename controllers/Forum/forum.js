const ErrorResponse = require('../../utils/ErrorResponse');
const asyncHandler = require('../../middleware/async');

const Forum = require('../../models/Forum/Forum');

//@desc     Get topic by ID
//@route    GET /api/v1/forum/forums/[id]
//@access   Public
exports.getForum = asyncHandler(async (req, res, next) =>{
    res.status(200).json({
        success: true,
        data: 'Get forum by ID route'
    })
});

//@desc     Create forum
//@route    POST /api/v1/forum/forums
//@access   Private
exports.createForum = asyncHandler(async (req, res, next) =>{
    res.status(200).json({
        success: true,
        data: 'create a forum route'
    })
});

//@desc     Update a topic
//@route    PUT /api/v1/forum/forums/[id]
//@access   Private
exports.updateForum = asyncHandler(async (req, res, next) =>{
    res.status(200).json({
        success: true,
        data: 'Update a Forum Route'
    })
});

//@desc     Delete a topic
//@route    DELETE /api/v1/forum/forums/[id]
//@access   Private
exports.deleteForum = asyncHandler(async (req, res, next) =>{
    res.status(200).json({
        success: true,
        data: 'delete a forum route'
    })
});