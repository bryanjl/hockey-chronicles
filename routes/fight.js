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
    updateComment
} = require('../controllers/fight');

//Model
const Fight = require('../models/Fight');

//import middleware
const advancedResults = require('../middleware/advancedResults');
const { updatePlayerData } = require('../middleware/updatePlayerData');

const router = express.Router();

router
    .route('/')
    .get(advancedResults(Fight, [
        {
            path: 'season',
            select: 'season'
        },
        {
            path: 'teams',
            select: 'city name'
        },
        {
            path: 'league',
            select: 'name'
        },
        {
            path: 'players',
            select: 'firstName lastName'
        }
    ], 'date'), getAllFights)
    .post(createFight);

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

module.exports = router;