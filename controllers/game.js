const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');

//models
const Game = require('../models/Game');
const League = require('../models/League');
const Season = require('../models/Season');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Fight = require('../models/Fight');


//@desc     Get all Games
//@route    GET /api/v1/games
//@access   Public
exports.getAllGames = asyncHandler(async (req, res,next) => {
    res.status(200).json({
        success: true,
        message: 'route for getting all games'
    });
});

//@desc     Create a new game
//@route    POST /api/v1/games
//@access   Private
exports.createGame = asyncHandler(async (req, res,next) => {
    try {
        let gameInfo = {};
    
    //set date
    gameInfo.date = new Date(req.body.date);

    //set teams
    let teams = [];
    let team1 = await Team.findOne({ city: req.body.teams[0] });
    let team1Info = {
        id: team1._id,
        city: team1.city,
        name: team1.name
    }
    teams.push(team1Info);

    let team2 = await Team.findOne({ city: req.body.teams[1] });
    let team2Info = {
        id: team2._id,
        city: team2.city,
        name: team2.name
    }
    teams.push(team2Info);

    gameInfo.teams = teams

    //set league
    let leagueInfo = await League.findOne({ name: req.body.league });

    let league = {
        id: leagueInfo._id,
        name: leagueInfo.name
    }

    gameInfo.league = league;

    //set season
    let seasonInfo = await Season.findOne({ season: req.body.season });

    let season = {
        id: seasonInfo._id,
        season: seasonInfo.season
    }

    gameInfo.season = season;

    //set gameType
    if(req.body.gameType){
        gameInfo.gameType = req.body.gameType 
    }
    
    let game = await Game.create(gameInfo);

    if(req.body.fightId){
        game.fights.push(req.body.fightId);
        game.markModified('fights');
        await game.save();
    }

    res.status(200).json({
        success: true,
        data: game
    });
    } catch (error) {
        console.log(error);
    }
    
    
});

//@desc     Get a game by ID
//@route    GET /api/v1/games/:id
//@access   Public
exports.getGame = asyncHandler(async (req, res,next) => {
    res.status(200).json({
        success: true,
        message: 'route for getting game by ID'
    });
});

//@desc     Update a game by ID
//@route    PUT /api/v1/games/:id
//@access   Private
exports.updateGame = asyncHandler(async (req, res,next) => {
    res.status(200).json({
        success: true,
        message: 'route for updating a game by ID'
    });
});

//@desc     Delete a game by ID
//@route    DELETE /api/v1/games/:id
//@access   Private
exports.deleteGame = asyncHandler(async (req, res,next) => {
    res.status(200).json({
        success: true,
        message: 'route for deleting a game by ID'
    });
});

//@desc     Post a comment to a game using ID
//@route    POST /api/v1/games/:id/comments
//@access   Private - logged in user
exports.postComment = asyncHandler(async (req, res,next) => {
    res.status(200).json({
        success: true,
        message: 'route for posting a comment to a game'
    });
});

const sendPopulatedResponse = asyncHandler(async (game, statusCode, res) => {
    //populate with data 
game = await Game.findById(game._id)
    .populate('fights', 'players outcome fightType actionRating unfair')
    .populate('league', 'name')
    .populate('season', 'season')
    .populate('teams', 'city name')
    .populate('comments', 'comment createdAt');

res.status(statusCode).json({
    success: true,
    data: game
});
});