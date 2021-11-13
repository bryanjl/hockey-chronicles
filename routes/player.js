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
    .get(advancedResults(Player, {
        path: 'fights', 
        populate: [{ 
            path: 'teams', 
            select: 'name city'
        },
        {
            path: 'players',
            select: 'lastName firstName'
             
        },
        {
            path: 'league',
            select: 'name'
        },
        {
            path: 'season',
            select: 'season'
        }]
    }, 'lastName'), getAllPlayers)
    .post(createPlayer);

router
    .route('/:id')
    .get(getPlayer)
    .put(updatePlayer)
    .delete(deletePlayer);

module.exports = router;
