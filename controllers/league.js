const asyncHandler = require('../middleware/async');
const League = require('../models/League');
const Fight = require('../models/Fight');
const Game = require('../models/Game');
const ErrorResponse = require('../utils/ErrorResponse');

//@desc     Get all leagues
//@route    GET /api/v1/league/
//@access   Public
exports.getAllLeagues = asyncHandler(async (req, res, next) => {
    console.log('here')
    let leagues = await League.find().select('-fights -games');
    // res.status(200).json(res.advancedResults);
    res.status(200).json({
        success: true,
        data: leagues
    });
});

//@desc     Get a league by ID
//@route    GET /api/v1/league/:id
//@access   Public
exports.getLeague = asyncHandler(async (req, res, next) => {
    let league = await League.findById(req.params.id).select('-games -fights');
    if(!league){
        return next(new ErrorResponse(`League with ID of ${req.params.id} Not Found`, 404));
    }

    // res.status(200).json({
    //     success: true,
    //     data: league
    // })

    let reqResObj = {
        req,
        res
    }

    if(req.query.season){
        sendPopulatedResponse(reqResObj, league, 200);
    } else {
        let data = res.leagueData.data;
        let pagination = res.leaguePagination.pagination;
        res.status(200).json({
            success: true,
            league,
            data,
            pagination
        })
    }

});

//@desc     Create a league
//@route    POST /api/v1/league/
//@access   Private - logged in user
exports.createLeague = asyncHandler(async (req, res, next) => {
    req.body.name = req.body.name.toUpperCase();

    req.body.leagueImageFile = req.body.imageFile;

    let league = await League.create(req.body);

    let reqResObj = {
        req,
        res,
    }
    
    sendPopulatedResponse(reqResObj, league, 200);
});

//@desc     Update a league
//@route    PUT /api/v1/league/:id
//@access   Private - logged in user
exports.updateLeague = asyncHandler(async (req, res, next) => {
    let league = await League.findById(req.params.id);
    if(!league){
        return next(new ErrorResponse(`League with ID ${req.params.id} Not Found`, 404));
    }

    if(req.body.name){
        req.body.name = req.body.name.toUpperCase();
    }

    if(req.body.fights){
        return next(new ErrorResponse(`Cannot update fights of a season`, 400));
    }
    
    league = await League.findByIdAndUpdate(req.params.id, req.body);

    let reqResObj = {
        req,
        res
    }

    sendPopulatedResponse(reqResObj, league, 200);
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

const sendPopulatedResponse = asyncHandler(async function (reqResObj, league, statusCode){
  //Must send season (1960-1961) to get populated response
    let fightDocumentArray = await Fight.find({
        '_id': { $in: 
            league.fights
        },
        'season.season': reqResObj.req.query.season || '*'
    }).sort({'date': 1});

    //Get games
    let gameDocumentArray = await Game.find({
        '_id': { $in: 
            league.games
        },
        'season.season': reqResObj.req.query.season || '*'
    }).sort({'date': 1});

    league = await League.findById(league._id).select('-games -fights');

    reqResObj.res.status(statusCode).json({
        success: true,
        data: {
            league,
            fights: fightDocumentArray,
            games: gameDocumentArray
        }  
    });
});