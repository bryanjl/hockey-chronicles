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

const router = express.Router();

router
    .route('/')
    .get(getAllLeagues)
    .post(createLeague);

router
    .route('/:id')
    .get(getLeague)
    .put(updateLeague)
    .delete(deleteLeague);

module.exports = router;
