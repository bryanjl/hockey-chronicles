const express = require('express');
const {
    searchFights
} = require('../controllers/search');

const router = express.Router();

router
    .route('/')
    .get(searchFights);

module.exports = router;