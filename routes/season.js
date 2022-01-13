const express = require('express');
//controllers
const {
    getAllSeasons,
    getSeason,
    createSeason,
    updateSeason,
    deleteSeason
} = require('../controllers/season');

//import middleware
const advancedResults = require('../middleware/advancedResults');

//models
const Season = require('../models/Season');

const router = express.Router();

router
    .route('/')
    .get(advancedResults(Season, 'season', 'seasons', 'fights'), getAllSeasons)
    .post(createSeason);

router
    .route('/:id')
    .get(getSeason)
    .put(updateSeason)
    .delete(deleteSeason);

module.exports = router;
