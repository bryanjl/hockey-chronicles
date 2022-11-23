const express = require('express');

const {
    getThreads,
    getThread,
    createThread,
    updateThread,
    deleteThread,
} = require('../../controllers/Forum/thread'); 

const router = express.Router();

router
    .route('/')
    .get(getThreads)
    .post(createThread);

router  
    .route('/:id')
    .get(getThread)
    .put(updateThread)
    .delete(deleteThread);

module.exports = router;