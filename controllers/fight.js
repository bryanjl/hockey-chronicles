//middleware and utils
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');

//helper function
const { createFight } = require('./helpers/createFight');

//models
const Fight = require('../models/Fight');
const Game = require('../models/Game');
// const League = require('../models/League');
// const Season = require('../models/Season');
// const Team = require('../models/Team');
// const Player = require('../models/Player');
// const User = require('../models/User');
const Comment = require('../models/Comment');


//@desc     Get all fights
//@route    GET /api/v1/fights/
//@access   Public
exports.getAllFights = asyncHandler(async (req, res, next) => {
    //use advanced results middleware to paginate and process filtering
    res.status(200).json(res.advancedResults);
});


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
   
    let fight = await createFight(req);

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
    let fight = await Fight.findById(req.params.id);
    if(!fight){
        return next(new ErrorResponse(`Fight not found`, 404));
    }

    let game = await Game.findById(fight.game);
    if(!game) {
        return next(new ErrorResponse(`Game not found`, 404));
    }

    let newFightArr = game.fights.filter(elem => {
         return elem._id.toString() !== fight._id.toString();
    });

    game.fights = newFightArr;
    game.markModified('fights');
    await game.save();

    await Fight.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: `Fight with ID of ${req.params.id} removed from database`
    });
});

//@desc     Post a comment to a fight
//@route    POST /api/v1/fights/:id/comments
//@access   Private - logged in user
exports.postComment = asyncHandler(async (req, res, next) => {
    console.log(req.body);
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

//@desc     Delete comment from fight
//@route    DELETE /api/v1/fights/:id/comments
//@access   Private - logged in user
exports.deleteComment = asyncHandler(async (req, res, next) => {
    //get fight by params ID
    let fight = await Fight.findById(req.params.id);

    if(!fight){
        return next(new ErrorResponse(`Cannot find fight with ID of ${req.params.id}`, 404));
    }

    await Comment.findByIdAndDelete(req.body.commentId);

    let updatedComments = fight.comments.filter((comment) => {
        return comment.toString() !== req.body.commentId
    })


    fight.comments = updatedComments;
    fight.markModified('comments');
    await fight.save();

    res.status(200).json({
        success: true,
        msg: 'Comment deleted'
    });
});

//@desc     Update comment from fight
//@route    PUT /api/v1/fights/:id/comments
//@access   Private - logged in user
exports.updateComment = asyncHandler(async (req, res, next) => {

    await Comment.findByIdAndUpdate(req.body.commentId, { body: req.body.body });

    res.status(200).json({
        success: true,
        msg: 'Comment updated'
    });
});

//@desc     Get the comments from a fight
//@route    GET /api/v1/fights/:id/comments
//@access   Public
exports.getComments = asyncHandler(async (req, res, next) => {
     //get fight by params ID
     let fight = await Fight.findById(req.params.id)
        .populate('comments', 'body createdAt parentId user username userId');

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

exports.topFiveMostFights = asyncHandler(async(req, res, next) => {
    res.status(200).json({
        success: true,
        data: {
            players: res.topFivePlayers,
            teams: res.topFiveTeams
        }
    });
});


const sendPopulatedResponse = asyncHandler(async (fight, statusCode, res) => {
        //populate with data 
    fight = await Fight.findById(fight._id)
        // .populate('league', 'name')
        // .populate('season', 'season')
        // .populate('players', 'firstName lastName position wins losses draws height weight shoots')
        // .populate('teams', 'city name')
        .populate('comments', 'body createdAt parentId user username');

    res.status(statusCode).json({
        success: true,
        data: fight
    });
});
