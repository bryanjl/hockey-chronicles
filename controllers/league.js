const asyncHandler = require('../middleware/async');
const League = require('../models/League');
const ErrorResponse = require('../utils/ErrorResponse');

//@desc     Get all leagues
//@route    GET /api/v1/league/
//@access   Public
exports.getAllLeagues = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

//@desc     Get a league by ID
//@route    GET /api/v1/league/:id
//@access   Public
exports.getLeague = asyncHandler(async (req, res, next) => {
    let league = await League.findById(req.params.id);
    if(!league){
        return next(new ErrorResponse(`League with ID of ${req.params.id} Not Found`, 404));
    }
    
    sendPopulatedResponse(league, 200, res);
});

//@desc     Create a league
//@route    POST /api/v1/league/
//@access   Private - logged in user
exports.createLeague = asyncHandler(async (req, res, next) => {
    req.body.name = req.body.name.toUpperCase();

    let league = await League.create(req.body);
    
    sendPopulatedResponse(league, 200, res);
});

//@desc     Update a league
//@route    PUT /api/v1/league/:id
//@access   Private - logged in user
exports.updateLeague = asyncHandler(async (req, res, next) => {
    let league = await League.findById(req.params.id);
    if(!league){
        return next(new ErrorResponse(`League with ID ${req.params.id} Not Found`, 404));
    }
    
    league = await League.findByIdAndUpdate(req.params.id, req.body);

    sendPopulatedResponse(league, 200, res);
});

//@desc     Delete a league by ID
//@route    DELETE /api/v1/league/:id
//@access   Private - SUPER-ADMIN
exports.deleteLeague = asyncHandler(async (req, res, next) => {
    let league = await League.findById(req.params.id);
    if(!league){
        return next(new ErrorResponse(`League with ID of ${req.params.id} Not Found`, 404));
    }
    
    await League.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: `League with ID ${req.params.id} has been removed from the Database`
    });
});

const sendPopulatedResponse = asyncHandler(async function (league, statusCode, res){
    league = await League.findById(league._id)
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
        data: league
    });
});