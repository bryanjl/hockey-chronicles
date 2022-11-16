const ErrorResponse = require('../../utils/ErrorResponse');
const asyncHandler = require('../../middleware/async');

const Post = require('../../models/Forum/Post');

//@desc     Get post by ID
//@route    GET /api/v1/forum/posts/[id]
//@access   Public
exports.getPost = asyncHandler(async (req, res, next) =>{
    res.status(200).json({
        success: true,
        data: 'Get Post by ID route'
    })
});

//@desc     Create Post
//@route    POST /api/v1/forum/posts
//@access   Private
exports.createPost = asyncHandler(async (req, res, next) =>{
    res.status(200).json({
        success: true,
        data: 'create a post route'
    })
});

//@desc     Update a Post
//@route    PUT /api/v1/forum/posts/[id]
//@access   Private
exports.updatePost = asyncHandler(async (req, res, next) =>{
    res.status(200).json({
        success: true,
        data: 'Update a Post Route'
    })
});

//@desc     Delete a Post
//@route    DELETE /api/v1/forum/posts/[id]
//@access   Private
exports.deletePost = asyncHandler(async (req, res, next) =>{
    res.status(200).json({
        success: true,
        data: 'delete a post route'
    })
});