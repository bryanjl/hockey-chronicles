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
const Comment = require('../models/Comment');

//@desc     Get a fight by ID
//@route    GET /api/v1/fights/:id
//@access   Public
exports.getFight = asyncHandler(async (req, res, next) => {
    //find fight by ID
    let fight  = await Fight.findById(req.params.id);
    if(!fight){
        return next(new ErrorResponse(`Fight with id of ${req.params.id} not found`, 404));
    }

    sendPopulatedResponse(fight, 200, res);
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
        outcome[element._id] = 1;
    });
    outcome.draw = 1;
    //set outcome object to request body
    req.body.outcome = outcome;

    //action rating average - freq counter
    let actionRating = {
        average: 0,
        votes: 0
    };
    //set actionRating to request body
    req.body.actionRating = actionRating;    

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
    // console.log(req.body);

    //get fight by ID
    let fight = await Fight.findById(req.params.id);
    if(!fight){
        return next(new ErrorResponse(`Fight not found`, 404));
    }

    //outcome update for fight winner
    //req.body.outcome is the outcome object
    if(req.body.outcome){

        //update fight outcome
        await fight.updateOutcome(req.body.outcome);

        //mark modified to save
        fight.markModified('outcome');
        //remove from req.body
        delete req.body.outcome;
    }

    //set actionRating
    if(req.body.actionRating){
        if(req.body.actionRating < 0 || req.body.actionRating > 10){
            return next(new ErrorResponse(`Action Rating must be between 0 and 10`, 400));
        }

        await fight.updateActionRating(req.body.actionRating);
        fight.markModified('actionRating');
        //remove from req.body
        delete req.body.actionRating;
    }

    if(req.body.unfair === true || req.body.unfair === false){
        await fight.updateUnfair(req.body.unfair);
        fight.markModified('unfair');
        //remove from req.body
        delete req.body.unfair;
    }

    //change the players of a fight
    if(req.body.players){
        if(req.body.players.length < 2 || req.body.players > 2){
            return next(new ErrorResponse(`You can only change two players - The first player is the player to remove and the second player is the player to add`));
        }
        if(!fight.players.includes(req.body.players[0])){
            return next(new ErrorResponse(`Player to change is not part of this fight`, 400));
        }
        if(fight.players.includes(req.body.players[1])){
            return next(new ErrorResponse(`The player you would like to add to this fight is already a part of this fight`, 400));
        }
        //req.body.players is array -> [0] is the player to change [1] is the player to change to
        await fight.updatePlayers(req.body.players);
        fight.markModified('outcome');
        fight.markModified('players');
        delete req.body.players;
    }

    //change the teams
    if(req.body.teams){
        //check req.body.teams format
        //must be two teams
        if(req.body.teams.length != 2){
            return next(new ErrorResponse(`Make sure there are two teams in your request`, 400));
        }
        //make sure team to change is part of the fight
        if(!fight.teams.includes(req.body.teams[0])){
            return next(new ErrorResponse(`The team to change is not part of this fight`, 400));
        }
        //make sure team to change to is not part of the fight
        if(fight.teams.includes(req.body.teams[1])){
            return next(new ErrorResponse(`The team you would like to add is already part of this fight`, 400));
        }

        //first item is team to change and second item is team to change to
        await fight.updateTeams(req.body.teams);
        fight.markModified('teams');
        delete req.body.teams;
    }

    //change the seasons
    if(req.body.season){
        //check format

        await fight.updateSeason(req.body.season);
        fight.markModified('season');
        delete req.body.season;
    }

    if(req.body.league){
        await fight.updateLeague(req.body.league);
        fight.markModified('league');
        delete req.body.league;
    }

    await fight.save();

    //update fight with left over information
    if(Object.keys(req.body).length > 0){
        // console.log('here');
        fight = await Fight.findByIdAndUpdate(req.params.id, req.body);

    }

    sendPopulatedResponse(fight, 200, res);
});

//@desc     Delete a fight by ID
//@route    DELETE /api/v1/fights/:id
//@access   Private - logged in user
exports.deleteFight = asyncHandler(async (req, res, next) => {
    //fights should not be deleted -> no method/function
    res.status(200).json({
        success: true,
        message: `Route for deleting a fight by id of ${req.params.id}`
    });
});

//@desc     Post a comment to a fight
//@route    POST /api/v1/fights/:id/comments
//@access   Private - logged in user
exports.postComment = asyncHandler(async (req, res, next) => {
    // console.log(req.body);
    // Make sure there is a comment in the body
    if(!req.body.body){
        return next(new ErrorResponse(`Please add a comment`, 400));
    }
    
    //get fight by params ID
    let fight = await Fight.findById(req.params.id);

    if(!fight){
        return next(new ErrorResponse(`Cannot find fight with ID of ${req.params.id}`, 404));
    }

    //create new comment
    let comment = await Comment.create(req.body);

    //add comment to fight
    fight.comments.push(comment._id);
    fight.markModified('comments');
    await fight.save();

    sendPopulatedResponse(fight, 200, res);
});

//@desc     Get the comments from a fight
//@route    GET /api/v1/fights/:id/comments
//@access   Public
exports.getComments = asyncHandler(async (req, res, next) => {
     //get fight by params ID
     let fight = await Fight.findById(req.params.id)
        .populate('comments', 'body createdAt parentId user username');

     if(!fight){
         return next(new ErrorResponse(`Cannot find fight with ID of ${req.params.id}`, 404));
     }

     res
        .status(200)
        .json({
            success: true,
            data: fight.comments
        })
});


const sendPopulatedResponse = asyncHandler(async (fight, statusCode, res) => {
        //populate with data 
    fight = await Fight.findById(fight._id)
        .populate('league', 'name')
        .populate('season', 'season')
        .populate('players', 'firstName lastName position wins losses draws height weight shoots')
        .populate('teams', 'city name')
        .populate('comments', 'body createdAt parentId user username');

    res.status(statusCode).json({
        success: true,
        data: fight
    });
});
