const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');

//models
const Game = require('../models/Game');


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
    res.status(200).json({
        success: true,
        message: 'route for creating a new game'
    });
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