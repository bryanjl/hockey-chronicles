const express = require('express');
const { 
    register, 
    login, 
    logout,
    getMe, 
    forgotPassword, 
    resetPassword, 
    updateDetails,
    updatePassword 
} = require('../controllers/auth');

const router = new express.Router();

const { protect } = require('../middleware/auth');

router
    .route('/register')
    .post(register);

router
    .route('/login')
    .post(login);

router
    .route('/logout')
    .get(protect, logout);

router  
    .route('/me')
    .get(protect, getMe);

router
    .route('/forgotPassword')
    .post(forgotPassword);

router
    .route('/updatedetails')
    .put(protect, updateDetails);

router
    .route('/updatepassword')
    .put(protect, updatePassword);

router
    .route('/resetpassword/:resettoken')
    .put(resetPassword);

module.exports = router;