const ErrorResponse = require('../../utils/ErrorResponse');
const asyncHandler = require('../../middleware/async');

const Forum = require('../../models/Forum/Forum');

//@desc     Get forums by topic ID
//@route    GET /api/v1/forum/forums?topic=[id]
//@access   Public
exports.getForums = asyncHandler(async (req, res, next) => {
    //console.log(req.query.topic)
    let forums = await Forum.find({'topic': req.query.topic});

    res.status(200).json({
        success: true,
        data: forums
    });
});

//@desc     Get topic by ID
//@route    GET /api/v1/forum/forums/[id]
//@access   Public
exports.getForum = asyncHandler(async (req, res, next) =>{
    let forum = await Forum.findById(req.params.id);

    if(!forum){
        return next(new ErrorResponse(`Cannot find forum with ID ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        data: forum
    });
});

//@desc     Create forum
//@route    POST /api/v1/forum/forums
//@access   Private
exports.createForum = asyncHandler(async (req, res, next) =>{
    try {
        
        let forum = await Forum.create(req.body);

        res.status(200).json({
            success: true,
            data: forum
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: error.message
        });
    }
});

//@desc     Update a topic
//@route    PUT /api/v1/forum/forums/[id]
//@access   Private
exports.updateForum = asyncHandler(async (req, res, next) =>{
    let forum = await Forum.findByIdAndUpdate(req.params.id, req.body);

    if(!forum){
        return next(new ErrorResponse(`Cannot Find Forum with ID ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: forum
    });
});

//@desc     Delete a topic
//@route    DELETE /api/v1/forum/forums/[id]
//@access   Private
exports.deleteForum = asyncHandler(async (req, res, next) =>{
    try {
        await Forum.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            msg: `Forum with ID ${req.params.id} successfully deleted`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: `Server Error`
        });
    }
});