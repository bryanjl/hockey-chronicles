const express = require('express');

const {
    getPost,
    createPost,
    updatePost,
    deletePost,
} = require('../../controllers/Forum/post'); 

const router = express.Router();

router
    .route('/')
    .post(createPost);

router  
    .route('/:id')
    .get(getPost)
    .put(updatePost)
    .delete(deletePost);

module.exports = router;
