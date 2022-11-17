const ErrorResponse = require('../../utils/ErrorResponse');
const asyncHandler = require('../../middleware/async');

const Topic = require('../../models/Forum/Topic');

//@desc     Get all Topics
//@route    GET /api/v1/forum/topics
//@access   Public
exports.getAllTopics = asyncHandler(async (req, res, next) =>{
    let topics = await Topic.find();

    if(!topics){
        return next(new ErrorResponse(`Server Error`, 500));
    }

    res.status(200).json({
        success: true,
        data: topics
    })
});

//@desc     Get topic by ID
//@route    GET /api/v1/forum/topics/[id]
//@access   Public
exports.getTopic = asyncHandler(async (req, res, next) =>{
    let topic = await Topic.findById(req.params.id);

    if(!topic){
        return next(new ErrorResponse(`Topic with ID ${req.params.id} Not foud`, 404));
    }

    res.status(200).json({
        success: true,
        data: topic
    })
});

//@desc     Create topic
//@route    POST /api/v1/forum/topics
//@access   Private
exports.createTopic = asyncHandler(async (req, res, next) =>{
    console.log(req.body);
    let topic = await Topic.create(req.body);

    if(!topic) {
        return next(new ErrorResponse(`Unable to create topic`, 500));
    }

    res.status(200).json({
        success: true,
        data: topic
    })
});

//@desc     Update a topic
//@route    PUT /api/v1/forum/topics/[id]
//@access   Private
exports.updateTopic = asyncHandler(async (req, res, next) =>{
    let topic = await Topic.findByIdAndUpdate(req.params.id, req.body)

    if(!topic){
        return next(new ErrorResponse(`Cannot find ID of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: topic
    })
});

//@desc     Delete a topic
//@route    DELETE /api/v1/forum/topics/[id]
//@access   Private
exports.deleteTopic = asyncHandler(async (req, res, next) =>{
    try {
        await Topic.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            msg: `Deleted successfully`
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: error.message
        })
    }    
});