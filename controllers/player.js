//middleware/Utils
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');
//models
const Player = require('../models/Player');

//@desc     Get all Players
//@route    GET /api/v1/players/
//@access   Public
exports.getAllPlayers = asyncHandler(async (req, res, next) => {
    //use advanced results middleware to paginate and process filtering
    res.status(200).json(res.advancedResults);
});

//@desc     Get a player by ID
//@route    GET /api/v1/players/:id
//@access   Public
exports.getPlayer = asyncHandler(async (req, res, next) => {
    let player = await Player.findById(req.params.id);

    if(!player){
        return next(new ErrorResponse(`Player with ID of ${req.params.id} not found`, 404));
    }
    
    sendPopulatedResponse(player, 200, res);
});

//@desc     Create a player
//@route    POST /api/v1/players/
//@access   Private - logged in user
exports.createPlayer = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for creating a player`
    });
});

//@desc     Update a player
//@route    PUT /api/v1/players/:id
//@access   Private - logged in user
exports.updatePlayer = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for updating a player`
    });
});

//@desc     Delete a player by ID
//@route    DELETE /api/v1/league/:id
//@access   Private - SUPER-ADMIN
exports.deletePlayer = asyncHandler(async (req, res, next) => {
    //No need to delete player 
    res.status(200).json({
        success: true,
        message: `Route for deleting a player with id of ${req.params.id}`
    });
}); 

const sendPopulatedResponse = asyncHandler(async function (player, statusCode, res){
    player = await Player.findById(player.id)
        .populate('fights', 'teams players season league date');

    res.status(statusCode).json({
        success: true,
        data: player
    })
});