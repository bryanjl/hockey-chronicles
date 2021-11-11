//middleware and utils
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');

//models
const Fight = require('../models/Fight');
const League = require('../models/League');
const Season = require('../models/Season');
const Team = require('../models/Team');
const Player = require('../models/Player');
// const User = require('../models/User');
// const Comment = require('../models/Comment');

//@desc     Get a fight by ID
//@route    GET /api/v1/fights/:id
//@access   Public
exports.getFight = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `route to get a fight from collection using ID of ${req.params.id}`
    })
});

//@desc     Create a new fight
//@route    POST /api/v1/fights/
//@access   Private - logged in user
exports.createFight = asyncHandler(async (req, res, next) => { 

    //get objectID to save for relations 
    let league = await League.findOne({  name: req.body.league.toUpperCase() }, '_id' );
    if(!league){
        return next(new ErrorResponse('League not found', 404));
    } else {
        req.body.league = league;
    }

    let season = await Season.findOne({  season: req.body.season }, '_id');
    if(!season){
        return next(new ErrorResponse('Season not found - Check format (YYYY-YYYY)', 404));
    } else {
        req.body.season = season;
    }

    //!!!Test for different number of players/wrong spelling etc
    //!!How to handle unknow players/fighters???
    let players = await Player.find({
        lastName: {
            $in: req.body.players
        }
    }, '_id');

    if(players.length === 0){
        return next(new ErrorResponse(`No players found`, 404));
    } else {
        req.body.players = players;
    }
    

    let teams = await Team.find({
        name: {
            $in: req.body.teams
        }
    }, '_id');

    if(teams.length != 2){
        return next(new ErrorResponse(`Must have two teams`, 400));
    } else {
        req.body.teams = teams;
    }

    //outcome frequency counter for voting
    let outcome = {};
    req.body.players.forEach(element => {
        outcome[element._id] = 0;
    });

    //set outcome object to request body
    req.body.outcome = outcome;

    //Date of fight
    req.body.date = new Date(req.body.date);

    // create fight
    let fight = await Fight.create(req.body);

    if(!fight){
        return next(new ErrorResponse(`Unable to create fight - Server Error`, 500));
    }

    sendPopulatedResponse(fight, 200, res);
});

//@desc     Update a fight by ID
//@route    PUT /api/v1/fights/:id
//@access   Private - logged in user
exports.updateFight = asyncHandler(async (req, res, next) => {
    //get fight by ID
    let fight = await Fight.findById(req.params.id);
    if(!fight){
        return next(new ErrorResponse(`Fight not found`, 404));
    }

    //outcome update for fight winner
    //req.body.outcome MUST have player who recieves vote at position 0 index in array
    if(req.body.outcome){
        if(req.body.outcome.length != 2){
            return next(new ErrorResponse(`Please have 2 players`, 400));
        }

        //update fight outcome
        fight.updateOutcome(req.body.outcome[0], req.body.outcome[1]);

        //mark modified to save
        fight.markModified('outcome');
    }

    fight.save();

    sendPopulatedResponse(fight, 200, res);
});

//@desc     Delete a fight by ID
//@route    DELETE /api/v1/fights/:id
//@access   Private - logged in user
exports.deleteFight = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for deleting a fight by id of ${req.params.id}`
    });
});

const sendPopulatedResponse = asyncHandler(async (fight, statusCode, res) => {
        //populate with data 
    fight = await Fight.findById(fight._id)
        .populate('league', 'name')
        .populate('season', 'season')
        .populate('players', 'firstName lastName')
        .populate('teams', 'city name');

    res.status(statusCode).json({
        success: true,
        data: fight
    });
});
