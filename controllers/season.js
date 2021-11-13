const asyncHandler = require('../middleware/async');
const Season = require('../models/Season');
const ErrorResponse = require('../utils/ErrorResponse');

//@desc     Get all Seasons
//@route    GET /api/v1/seasons/
//@access   Public
exports.getAllSeasons = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

//@desc     Get a season by ID
//@route    GET /api/v1/seasons/:id
//@access   Public
exports.getSeason = asyncHandler(async (req, res, next) => {
    let season = await Season.findById(req.params.id);
    if(!season){
        return next(new ErrorResponse(`Season with ID of ${req.params.id} Not Found`, 404))
    }

    sendPopulatedResponse(season, 200, res);
});

//@desc     Create a season
//@route    POST /api/v1/seasons/
//@access   Private - logged in user
exports.createSeason = asyncHandler(async (req, res, next) => {
    //check proper format
    let seasonFormat = /(19|20)\d{2}-(19|20)\d{2}/g;
    if(!seasonFormat.test(req.body.season)){
        return next(new ErrorResponse(`Please use proper format YYYY-YYYY for seasons`));
    }
    
    let season = await Season.create(req.body);

    sendPopulatedResponse(season, 200, res);
});

//@desc     Update a season
//@route    PUT /api/v1/seasons/:id
//@access   Private - logged in user
exports.updateSeason = asyncHandler(async (req, res, next) => {
    let season = await Season.findById(req.params.id);
    if(!season){
        return next(new ErrorResponse(`Season with ID ${req.params.id} Not Found`, 404));
    }

    if(req.body.fights){
        return next(new ErrorResponse(`Cannot update fights of a season`, 400));
    }

    season = await Season.findByIdAndUpdate(req.params.id, req.body);

    sendPopulatedResponse(season, 200, res);
});

//@desc     Delete a season by ID
//@route    DELETE /api/v1/seasons/:id
//@access   Private - SUPER-ADMIN
exports.deleteSeason = asyncHandler(async (req, res, next) => {
    let season = await Season.findById(req.params.id);
    if(!season){
        return next(new ErrorResponse(`Season with ID ${req.params.id} Not Found`, 404));
    }

    await Season.findByIdAndDelete(req.params.id);

    // No need to delete a season
    res.status(200).json({
        success: true,
        message: `Season with ID of ${req.params.id} has been removed from the Database`
    });
}); 

const sendPopulatedResponse = asyncHandler(async function (season, statusCode, res){
    season = await Season.findById(season._id)
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
        data: season
    });
});