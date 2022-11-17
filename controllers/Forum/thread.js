const ErrorResponse = require('../../utils/ErrorResponse');
const asyncHandler = require('../../middleware/async');

const Thread = require('../../models/Forum/Thread');

//@desc     Get thread by ID
//@route    GET /api/v1/forum/threads/[id]
//@access   Public
exports.getThread = asyncHandler(async (req, res, next) =>{
    let thread = await Thread.findById(req.params.id);

    if(!thread){
        return next(new ErrorResponse(`Cannot find thread with ID of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: thread
    });
});

//@desc     Create thread
//@route    POST /api/v1/forum/threads
//@access   Private
exports.createThread = asyncHandler(async (req, res, next) =>{
    try {
        let thread = await Thread.create(req.body);

        res.status(200).json({
            success: true,
            data: thread
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: error.message
        }); 
    }
});

//@desc     Update a thread
//@route    PUT /api/v1/forum/threads/[id]
//@access   Private
exports.updateThread = asyncHandler(async (req, res, next) =>{
    let thread = await Thread.findByIdAndUpdate(req.params.id, req.body);

    if(!thread){
        return next(new ErrorResponse(`Cannot find thread with ID ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: thread
    });
});

//@desc     Delete a thread
//@route    DELETE /api/v1/forum/threads/[id]
//@access   Private
exports.deleteThread = asyncHandler(async (req, res, next) =>{
    try {
        await Thread.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            msg: `Thread with ID ${req.params} successfully deleted`
        });
    } catch (error) {
        res.status(500).json({
            success: true,
            msg: error.message
        });
    }    
});