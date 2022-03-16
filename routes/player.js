const express = require('express');
//middleware
const multerImageUpload = require('../middleware/imageUpload');
const upload = multerImageUpload('players');
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
    .post(upload.single('playerImg'), createPlayer);

router  
    .route('/search')
    .get(playerSearch);

router
    .route('/:id')
    .get(getPlayer)
    .put(updatePlayer)
    .delete(deletePlayer);



module.exports = router;
