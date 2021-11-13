const express = require('express');
//controllers
const {
    getAllTeams,
    getTeam,
    createTeam,
    updateTeam,
    deleteTeam
} = require('../controllers/team');

//import middleware
const advancedResults = require('../middleware/advancedResults');

//models
const Team = require('../models/Team');

const router = express.Router();

router
    .route('/')
    .get(advancedResults(Team, [
        {
            path: 'league',
            select: 'name'
        },
        {
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
            ]
        }
        ], 'name'), getAllTeams)
    .post(createTeam);

router
    .route('/:id')
    .get(getTeam)
    .put(updateTeam)
    .delete(deleteTeam);

module.exports = router;