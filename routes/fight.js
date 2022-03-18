const express =  require('express');
//import controllers
const {
    getAllFights,
    getFight,
    createFight,
    updateFight,
    deleteFight,
    postComment,
    getComments,
    deleteComment,
    updateComment,
    topFiveMostFights,
    getFeaturedFight,
    setFeaturedFight
} = require('../controllers/fight');

//Model
const Fight = require('../models/Fight');

//import middleware
const advancedResults = require('../middleware/advancedResults');
const { updatePlayerData } = require('../middleware/updatePlayerData');
const topFive = require('../middleware/topFive');

const router = express.Router();

router
    .route('/')
    .get(advancedResults(Fight, 'date', 'fights'), getAllFights)
    .post(createFight);

router
    .route('/topfive')
    .get(topFive(Fight), topFiveMostFights);

router  
    .route('/featuredfight')
    .get(getFeaturedFight)
    .put(setFeaturedFight);

router
    .route('/:id')
    .get(updatePlayerData, getFight)
    .put(updateFight)
    .delete(deleteFight);

router
    .route('/:id/comments')
    .post(postComment)
    .get(getComments)
    .delete(deleteComment)
    .put(updateComment);

router
    .route('/topfive')
    .get(topFive(Fight), topFive);

module.exports = router;