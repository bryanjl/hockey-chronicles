const express = require('express');
const router = new express.Router();
//controllers
const {
    getAllUsers
} = require('../controllers/admin');

//middleware
const { protect } = require('../middleware/auth');


router  
    .route('/users')
    .get(protect, getAllUsers);

module.exports = router;