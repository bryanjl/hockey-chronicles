const express = require('express');

const {
    getForum,
    createForum,
    updateForum,
    deleteForum,
} = require('../../controllers/Forum/forum'); 

const router = express.Router();

router
    .route('/')
    .post(createForum);

router  
    .route('/:id')
    .get(getForum)
    .put(updateForum)
    .delete(deleteForum);

module.exports = router;