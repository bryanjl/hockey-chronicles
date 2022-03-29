const express = require('express');
//import controllers
const {
    getAllGames,
    createGame,
    getGame,
    updateGame,
    deleteGame,
    postComment
} = require('../controllers/game');

//import middleware
const { fightCreate } = require('../middleware/fightCreate');
const advancedResults = require('../middleware/advancedResults');
const gameSearch = require('../middleware/gameSearch');

//import model
const Game = require('../models/Game');

const router = express.Router();

router 
    .route('/')
    .get(advancedResults(Game, 'date', 'games'), getAllGames) 
    .post(createGame);
    // fightCreate,  <---in post route????
router
    .route('/:id')
    .get(getGame)
    .put(updateGame)
    .delete(deleteGame);

router
    .route('/:id/comments')
    .post(postComment);

module.exports = router;

// advancedResults(Game, 'date', 'fights'), 