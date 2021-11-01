const asyncHandler = require('../middleware/async');
const League = require('../models/League');

//@desc     Get all leagues
//@route    GET /api/v1/league/
//@access   Public
exports.getAllLeagues = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for getting all leagues`
    });
});

//@desc     Get a league by ID
//@route    GET /api/v1/league/:id
//@access   Public
exports.getLeague = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for getting a league by id of ${req.params.id}`
    });
});

//@desc     Create a league
//@route    POST /api/v1/league/
//@access   Private - logged in user
exports.createLeague = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for creating a league`
    });
});

//@desc     Update a league
//@route    PUT /api/v1/league/:id
//@access   Private - logged in user
exports.updateLeague = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for updating a league`
    });
});

//@desc     Delete a league by ID
//@route    DELETE /api/v1/league/:id
//@access   Private - SUPER-ADMIN
exports.deleteLeague = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for deleting a league`
    });
});