const express = require('express');
//controllers
const {
    getAllPlayers,
    getPlayer,
    createPlayer,
    updatePlayer,
    deletePlayer,
    playerSearch
} = require('../controllers/player');

//import middleware
const advancedResults = require('../middleware/advancedResults');

//Models
const Player = require('../models/Player');

const router = express.Router();

router
    .route('/')
    .get(advancedResults(Player, 'lastName', 'default'), getAllPlayers)
    .post(createPlayer);

router  
    .route('/search')
    .get(playerSearch);

router
    .route('/:id')
    .get(getPlayer)
    .put(updatePlayer)
    .delete(deletePlayer);



module.exports = router;
