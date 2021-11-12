const express = require('express');
//controllers
const {
    getAllPlayers,
    getPlayer,
    createPlayer,
    updatePlayer,
    deletePlayer
} = require('../controllers/player');

//import middleware
const advancedResults = require('../middleware/advancedResults');

//Models
const Player = require('../models/Player');

const router = express.Router();

router
    .route('/')
    .get(advancedResults(Player, {path: 'fights', select: 'teams'}, 'lastName'), getAllPlayers)
    .post(createPlayer);

router
    .route('/:id')
    .get(getPlayer)
    .put(updatePlayer)
    .delete(deletePlayer);

module.exports = router;
