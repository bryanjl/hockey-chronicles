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
// const advancedResults = require('../middleware/advancedResults');
const simpleSearch = require('../middleware/simpleSearch');

//models
const Team = require('../models/Team');

const router = express.Router();

router
    .route('/')
    .get(simpleSearch(Team, 'city', ['city', 'name', 'fullName']), getAllTeams)
    .post(createTeam);

router
    .route('/:id')
    .get(getTeam)
    .put(updateTeam)
    .delete(deleteTeam);

module.exports = router;