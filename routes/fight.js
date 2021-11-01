const express =  require('express');
//import controllers
const {
    getFight,
    createFight,
    updateFight,
    deleteFight
} = require('../controllers/fight');

//import middleware

const router = express.Router();

router
    .route('/:id')
    .get(getFight)
    .put(updateFight)
    .delete(deleteFight);

router
    .route('/')
    .post(createFight);



module.exports = router;