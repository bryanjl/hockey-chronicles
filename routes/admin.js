const express = require('express');
const router = new express.Router();
//controllers
const {
    getAllUsers,
    updateUserRole,
    deleteUser
} = require('../controllers/admin');

//middleware
const { protect } = require('../middleware/auth');


router  
    .route('/users')
    .get(protect, getAllUsers);

router  
    .route('/users/:id')
    .put(protect, updateUserRole)
    .delete(protect, deleteUser);

module.exports = router;