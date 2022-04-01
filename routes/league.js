const express = require('express');
//middleware
const multerImageUpload = require('../middleware/imageUpload');
const upload = multerImageUpload('leagues');
//controllers
const {
    getAllLeagues,
    getLeague,
    createLeague,
    updateLeague,
    deleteLeague
} = require('../controllers/league');

//import middleware
const advancedResults = require('../middleware/advancedResults');
const leagueData = require('../middleware/leagueData');

//models
const League = require('../models/League');

const router = express.Router();

router
    .route('/')
    .get(advancedResults(League, {
        path: 'fights', 
        populate: [
            { 
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
            }
        ]}, 'name'), getAllLeagues)
    .post(upload.single('leagueImg'), createLeague);

router
    .route('/:id')
    .get(leagueData(), getLeague)
    .put(updateLeague)
    .delete(deleteLeague);

module.exports = router;

 
