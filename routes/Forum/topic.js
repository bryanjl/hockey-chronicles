const express = require('express');

const {
    getAllTopics,
    getTopic,
    createTopic,
    updateTopic,
    deleteTopic,
} = require('../../controllers/Forum/topic'); 

const router = express.Router();

router
    .route('/')
    .get(getAllTopics)
    .post(createTopic);

router  
    .route('/:id')
    .get(getTopic)
    .put(updateTopic)
    .delete(deleteTopic);

module.exports = router;