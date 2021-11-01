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

const router = express.Router();

router
    .route('/')
    .get(getAllTeams)
    .post(createTeam);

router
    .route('/:id')
    .get(getTeam)
    .put(updateTeam)
    .delete(deleteTeam);

module.exports = router;