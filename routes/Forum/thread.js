const express = require('express');

const {
    getThread,
    createThread,
    updateThread,
    deleteThread,
} = require('../../controllers/Forum/thread'); 

const router = express.Router();

router
    .route('/')
    .post(createThread);

router  
    .route('/:id')
    .get(getThread)
    .put(updateThread)
    .delete(deleteThread);

module.exports = router;