const express = require('express');
const multer = require('multer');
const ErrorResponse = require('../utils/ErrorResponse');

//multer settings
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/teams/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.size > (1024 * 1024 * 3)){
        //file size greater than 3mb
        console.log('too large')
        cb(new ErrorResponse(`IMage size too large - must be under 3MB`, 400), false);    
    } else if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg'){
        console.log('mimetype')
        console.log(file);
        cb(new ErrorResponse(`Image must be a .png or .jpeg file`, 400), false);                
    } else {
        //accept file
        cb(null, true);
    }   
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});
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
    .post(upload.single('teamImg'), createTeam);

router  
    .route('/search')
    .get(teamSearch);

router
    .route('/:id')
    .get(getTeam)
    .put(updateTeam)
    .delete(deleteTeam);

module.exports = router;