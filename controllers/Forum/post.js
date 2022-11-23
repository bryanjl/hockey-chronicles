const ErrorResponse = require('../../utils/ErrorResponse');
const asyncHandler = require('../../middleware/async');

const Post = require('../../models/Forum/Post');

//@desc     Get posts by thread ID
//@route    GET /api/v1/forum/posts?thread=[id]
//@access   Public
exports.getPosts = asyncHandler(async (req, res, next) => {
    //console.log(req.query.topic)
    let posts = await Post.find({'thread': req.query.thread});

    res.status(200).json({
        success: true,
        data: posts
    });
});


//@desc     Get post by ID
//@route    GET /api/v1/forum/posts/[id]
//@access   Public
exports.getPost = asyncHandler(async (req, res, next) =>{
    let post = await Post.findById(req.params.id);

    if(!post){
        return next(new ErrorResponse(`Cannot find post with ID ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: post
    });
});

//@desc     Create Post
//@route    POST /api/v1/forum/posts
//@access   Private
exports.createPost = asyncHandler(async (req, res, next) =>{
    try {
        let post = await Post.create(req.body);

        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: error.message
        });
    }
});

//@desc     Update a Post
//@route    PUT /api/v1/forum/posts/[id]
//@access   Private
exports.updatePost = asyncHandler(async (req, res, next) =>{
    let post = await Post.findByIdAndUpdate(req.params.id, req.body);

    if(!post){
        return next(new ErrorResponse(`Cannot find post with ID ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: post
    });
});

//@desc     Delete a Post
//@route    DELETE /api/v1/forum/posts/[id]
//@access   Private
exports.deletePost = asyncHandler(async (req, res, next) =>{
    try {
        await Post.findByIdAndDelete(req.params.id);
    
        res.status(200).json({
            success: true,
            msg: `Post with ID ${req.params.id} deleted successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: error.message
        });
    }
});