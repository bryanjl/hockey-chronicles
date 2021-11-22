const express =  require('express');
//import controllers
const {
    getFight,
    createFight,
    updateFight,
    deleteFight,
    postComment
} = require('../controllers/fight');

//Model
// const Fight = require('../models/Fight');

//import middleware
// const advancedResults = require('../middleware/advancedResults');

const router = express.Router();

router
    .route('/')
    .post(createFight);

router
    .route('/:id')
    .get(getFight)
    .put(updateFight)
    .delete(deleteFight);

router
    .route('/:id/comments')
    .post(postComment);

module.exports = router;