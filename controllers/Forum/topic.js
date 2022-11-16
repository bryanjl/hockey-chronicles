const ErrorResponse = require('../../utils/ErrorResponse');
const asyncHandler = require('../../middleware/async');

const Topic = require('../../models/Forum/Topic');

//@desc     Get all Topics
//@route    GET /api/v1/forum/topics
//@access   Public
exports.getAllTopics = asyncHandler(async (req, res, next) =>{
    res.status(200).json({
        success: true,
        data: 'Get all topics route'
    })
});

//@desc     Get topic by ID
//@route    GET /api/v1/forum/topics/[id]
//@access   Public
exports.getTopic = asyncHandler(async (req, res, next) =>{
    res.status(200).json({
        success: true,
        data: 'Get topic by ID route'
    })
});

//@desc     Create topic
//@route    POST /api/v1/forum/topics
//@access   Private
exports.createTopic = asyncHandler(async (req, res, next) =>{
    res.status(200).json({
        success: true,
        data: 'create a topic route'
    })
});

//@desc     Update a topic
//@route    PUT /api/v1/forum/topics/[id]
//@access   Private
exports.updateTopic = asyncHandler(async (req, res, next) =>{
    res.status(200).json({
        success: true,
        data: 'Update a topic Route'
    })
});

//@desc     Delete a topic
//@route    DELETE /api/v1/forum/topics/[id]
//@access   Private
exports.deleteTopic = asyncHandler(async (req, res, next) =>{
    res.status(200).json({
        success: true,
        data: 'delete a topic route'
    })
});