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

//@desc     Search players by lastName 
//@route    GET /api/v1/players/search?query
//@access   Public
exports.playerSearch = asyncHandler(async (req, res, next) => {
    // console.log(req.query);
    const regex = new RegExp(req.query.lastName, 'gi');
    let results = await Player.find({ lastName: regex }).select('firstName lastName');

    res.status(200).json({
        players: results
    });
});

//@desc     Create a player
//@route    POST /api/v1/players/
//@access   Private - logged in user
exports.createPlayer = asyncHandler(async (req, res, next) => {
    //action rating average - freq counter
    let actionRating = {
        average: 0,
        votes: 0
    };
    //set actionRating to request body
    req.body.actionRating = actionRating;

    let player = await Player.create(req.body);

    sendPopulatedResponse(player, 200, res);
});

//@desc     Update a player
//@route    PUT /api/v1/players/:id
//@access   Private - logged in user
exports.updatePlayer = asyncHandler(async (req, res, next) => {
    let player = await Player.findById(req.params.id);
    if(!player){
        return next(new ErrorResponse(`Player with id ${req.params.id} not found`, 404));
    }

    //Cannot update/change wins, losses, or fights
    if(req.body.wins || req.body.losses || req.body.fights){
        return next(new ErrorResponse(`Cannot update wins, losses or fights of a Player`, 400));
    }

    player = await Player.findByIdAndUpdate(req.params.id, req.body, {new: true});

    sendPopulatedResponse(player, 200, res);
});

//@desc     Delete a player by ID
//@route    DELETE /api/v1/league/:id
//@access   Private - SUPER-ADMIN
exports.deletePlayer = asyncHandler(async (req, res, next) => {
    //MUST HAVE ADMIN PRIVALEGES - MIDDLEWARE

    let player = await Player.findById(req.params.id);
    if(!player){
        return next(new ErrorResponse(`Player with ID ${req.params.id} Not Found`, 404));
    }

    await Player.findByIdAndDelete(req.params.id);

    //No need to delete player 
    res.status(200).json({
        success: true,
        message: `Player with ID of ${req.params.id} removed from database`
    });
}); 

const sendPopulatedResponse = asyncHandler(async function (player, statusCode, res){
    player = await Player.findById(player._id)
        .populate({
            path: 'fights', 
            populate: [{ 
                path: 'teams', 
                select: 'name city'
            },
            {
                path: 'players',
                select: 'lastName firstName'
                 
            },
            {
                path: 'league',
                select: 'name'
            },
            {
                path: 'season',
                select: 'season'
            }]
        });

    res.status(statusCode).json({
        success: true,
        data: player
    });
});