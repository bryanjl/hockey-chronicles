const express = require('express');
const {
    searchFights,
    searchPlayers,
    searchTeams
} = require('../controllers/search');

const router = express.Router();

router
    .route('/teams')
    .get(searchTeams);

router
    .route('/players')
    .get(searchPlayers);

router
    .route('/fights')
    .get(searchFights);

module.exports = router;