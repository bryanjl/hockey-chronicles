//middleware and utils
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');

//helper function
const { createFight, createIntraSquadFight } = require('./helpers/createFight');

//models
const Fight = require('../models/Fight');
const Game = require('../models/Game');
const Comment = require('../models/Comment');
const Player = require('../models/Player');


//@desc     Get all fights
//@route    GET /api/v1/fights/
//@access   Public
exports.getAllFights = asyncHandler(async (req, res, next) => {
    //use advanced results middleware to paginate and process filtering
    // console.log(res.advancedResults)
    // console.log('from controller')
    res.status(200).json(res.advancedResults);
    // let fights = await Fight.find();

    // res.status(200).json({
    //     success: true,
    //     data: fights
    // })
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
    let fight = null;

    

    if (req.body.teams.length === 1) {
        
        fight = await createIntraSquadFight(req);
    } else {
        fight = await createFight(req);
    }

    console.log(fight);

    if(fight !== null){
        sendPopulatedResponse(fight, 200, res);
    } else {
        return next(new ErrorResponse(`Unable to create fight`, 500));
    }
    
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

    //check if the player is changing the team they fought for
    //team change only not player change
    //updates player.teams object 
    let players = fight.players;

    if(req.body.player1Team && !req.body.players){
        if(players[0].id.toString() === req.body.player1Team.player.id){
            players[0].teamId = req.body.player1Team.team.id;
            let playerInstance = await Player.findById(players[0].id);
            await playerInstance.updateTeamsPlayedFor(players[0], fight);
            playerInstance.markModified('teams');
            await playerInstance.save();
        }
        if(players[1].id.toString() === req.body.player1Team.player.id){
            players[1].teamId = req.body.player1Team.team.id;
            let playerInstance = await Player.findById(players[1].id);
            await playerInstance.updateTeamsPlayedFor(players[1], fight);
            playerInstance.markModified('teams');
            await playerInstance.save();
        }
        delete req.body.player1Team;
    }

    if(req.body.player2Team && !req.body.players){
        if(players[0].id.toString() === req.body.player2Team.player.id){
            players[0].teamId = req.body.player2Team.team.id;
            let playerInstance = await Player.findById(players[0].id);
            await playerInstance.updateTeamsPlayedFor(players[0], fight);
            playerInstance.markModified('teams');
            await playerInstance.save();
        }
        if(players[1].id.toString() === req.body.player2Team.player.id){
            players[1].teamId = req.body.player2Team.team.id;
            let playerInstance = await Player.findById(players[1].id);
            await playerInstance.updateTeamsPlayedFor(players[1], fight);
            playerInstance.markModified('teams');
            await playerInstance.save();
        }
        delete req.body.player2Team;
    }
    fight.players = players;
    fight.markModified('players');

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
        // if(req.body.players.length < 2 || req.body.players > 2){
        //     return next(new ErrorResponse(`You can only change two players - The first player is the player to remove and the second player is the player to add`));
        // }
        // if(!fight.players.includes(req.body.players[0])){
        //     return next(new ErrorResponse(`Player to change is not part of this fight`, 400));
        // }
        // if(fight.players.includes(req.body.players[1])){
        //     return next(new ErrorResponse(`The player you would like to add to this fight is already a part of this fight`, 400));
        // }
        //req.body.players is array -> [0] is the player to change [1] is the player to change to
        await fight.updatePlayers(req.body.players);
        fight.markModified('outcome');
        fight.markModified('players');
        delete req.body.players;
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

//@desc     Get the top five fights for players/teams
//@route    GET /api/v1/fights/topfive
//@access   Public
exports.topFiveMostFights = asyncHandler(async(req, res, next) => {
    res.status(200).json({
        success: true,
        data: {
            players: res.topFivePlayers,
            teams: res.topFiveTeams
        }
    });
});

//@desc     Get the featured fight
//@route    GET /api/v1/fights/featuredfight
//@access   Public
exports.getFeaturedFight = asyncHandler(async(req, res, next) => {
    let fight = await Fight.findOne({ featuredFight: true }).select(
        '-league -game -tookPlaceAt -createdBy -createdAt -time -winBy -unfair -fightType -gameType -outcome -comments -season -teams'
    );

    if(!fight){
        return next(new ErrorResponse(`Cannot find featured fight`, 404));
    }

    res.status(200).json({
        success: true,
        data: fight
    })
    //sendPopulatedResponse(fight, 200, res);
});

//@desc     Set the featured fight
//@route    PUT /api/v1/fights/featuredfight
//@access   Private - must be 'super' or 'admin'
exports.setFeaturedFight = asyncHandler(async(req, res, next) => {
    if(req.user.role !== 'super' && req.user.role !== 'admin'){
        return next(new ErrorResponse(`Not authorized for this route`, 401));
    }

    let fight = await Fight.findOne({ featuredFight: true });

    if(fight){
        fight.featuredFight = false;
        fight.markModified('featuredFight');
        await fight.save();
    }

    let newFeaturedFight = await Fight.findById(req.body.fightId);
    if(!newFeaturedFight){
        return next(new ErrorResponse(`Cannot find fight to feature`, 404));
    }

    newFeaturedFight.featuredFight = true;
    newFeaturedFight.markModified('featuredFight');
    await newFeaturedFight.save();

    sendPopulatedResponse(newFeaturedFight, 200, res);
});




const sendPopulatedResponse = asyncHandler(async (fight, statusCode, res) => {
    //populate with data 
    fight = await Fight.findById(fight._id)
        .populate('game', 'homeTeam')
        .populate('comments', 'body createdAt parentId user username');

    res.status(statusCode).json({
        success: true,
        data: fight
    });
});
