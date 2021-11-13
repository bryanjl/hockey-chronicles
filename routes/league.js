const express = require('express');
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
    .post(createLeague);

router
    .route('/:id')
    .get(getLeague)
    .put(updateLeague)
    .delete(deleteLeague);

module.exports = router;
