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

const router = express.Router();

router
    .route('/')
    .get(getAllPlayers)
    .post(createPlayer);

router
    .route('/:id')
    .get(getPlayer)
    .put(updatePlayer)
    .delete(deletePlayer);

module.exports = router;
