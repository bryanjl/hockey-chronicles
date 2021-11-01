const asyncHandler = require('../middleware/async');
const Season = require('../models/Season');

//@desc     Get all Seasons
//@route    GET /api/v1/seasons/
//@access   Public
exports.getAllSeasons = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for getting all seasons`
    });
});

//@desc     Get a season by ID
//@route    GET /api/v1/seasons/:id
//@access   Public
exports.getSeason = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for getting a season by id of ${req.params.id}`
    });
});

//@desc     Create a season
//@route    POST /api/v1/seasons/
//@access   Private - logged in user
exports.createSeason = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for creating a season`
    });
});

//@desc     Update a season
//@route    PUT /api/v1/seasons/:id
//@access   Private - logged in user
exports.updateSeason = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for updating a season with id of ${req.params.id}`
    });
});

//@desc     Delete a season by ID
//@route    DELETE /api/v1/seasons/:id
//@access   Private - SUPER-ADMIN
exports.deleteSeason = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for deleting a season with id of ${req.params.id}`
    });
}); 