const asyncHandler = require('../middleware/async');
const Player = require('../models/Player');

//@desc     Get all Players
//@route    GET /api/v1/players/
//@access   Public
exports.getAllPlayers = asyncHandler(async (req, res, next) => {
    console.log(req.params, req.query);

    let player = await Player.findOne({ lastName: req.query.lastName });
    
    res.status(200).json({
        success: true,
        message: `Route for getting all Players`,
        data: player
    });
});

//@desc     Get a player by ID
//@route    GET /api/v1/players/:id
//@access   Public
exports.getPlayer = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for getting a player by id of ${req.params.id}`
    });
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
    res.status(200).json({
        success: true,
        message: `Route for deleting a player with id of ${req.params.id}`
    });
}); 