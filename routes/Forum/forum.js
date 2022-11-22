const express = require('express');

const {
    getForums,
    getForum,
    createForum,
    updateForum,
    deleteForum,
} = require('../../controllers/Forum/forum'); 

const router = express.Router();

router
    .route('/')
    .get(getForums)
    .post(createForum);

router  
    .route('/:id')
    .get(getForum)
    .put(updateForum)
    .delete(deleteForum);

module.exports = router;