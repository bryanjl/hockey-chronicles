const express = require('express');
//import controllers
const {
    getAllGameStats
} = require('../controllers/stats');

const router = express.Router();

router
    .route('/games')
    .get(getAllGameStats)

module.exports = router;