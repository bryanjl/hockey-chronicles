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

const router = express.Router();

router
    .route('/')
    .get(getAllSeasons)
    .post(createSeason);

router
    .route('/:id')
    .get(getSeason)
    .put(updateSeason)
    .delete(deleteSeason);

module.exports = router;
