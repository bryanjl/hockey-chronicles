const express = require('express');
//controllers
const {
    getAllTeams,
    getTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    teamSearch
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
    .route('/search')
    .get(teamSearch);

router
    .route('/:id')
    .get(getTeam)
    .put(updateTeam)
    .delete(deleteTeam);

module.exports = router;