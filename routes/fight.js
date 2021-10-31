const express =  require('express');
//import controllers
const {
    getFight,
    createFight
} = require('../controllers/fight');

//import middleware

const router = express.Router();

router
    .route('/:id')
    .get(getFight);

router
    .route('/')
    .post(createFight);



module.exports = router;