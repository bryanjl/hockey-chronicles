//middleware & utils
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
//models
const League = require('../models/League');
const Team = require('../models/Team');
const Fight = require('../models/Fight');
const Game = require('../models/Game');

//@desc     Get all Teams
//@route    GET /api/v1/teams/
//@access   Public
exports.getAllTeams = asyncHandler(async (req, res, next) => {
    //use advanced results middleware
    res.status(200).json(res.simpleSearch);
});

//@desc     Get a team by ID
//@route    GET /api/v1/teams/:id
//@access   Public
exports.getTeam = asyncHandler(async (req, res, next) => {
    let team = await Team.findById(req.params.id);
    if(!team){
        return next(new ErrorResponse(`Team with ID ${req.params.id} Not Found`, 404));
    }

    let reqResObj = {
        req,
        res
    }

    if(req.query.season){
        sendPopulatedResponse(reqResObj, team, 200);
    } else {
        res.status(200).json({
            success: true,
            data: team
        });
    }
    
});

//@desc     Search teams by city
//@route    GET /api/v1/teams/search?query
//@access   Public
exports.teamSearch = asyncHandler(async (req, res, next) => {
    // console.log(req.query);
    const regex = new RegExp(req.query.city, 'gi');
    let results = await Team.find({ city: regex }).select('city name');

    res.status(200).json({
        teams: results
    });
});

//@desc     Create a team
//@route    POST /api/v1/teams/
//@access   Private - logged in user
exports.createTeam = asyncHandler(async (req, res, next) => {
    try {
        let league = await League.findOne({ name: req.body.league.toUpperCase() });
        if(!league){
            return next(new ErrorResponse(`League ${req.body.league} Not found`, 400));
        }
    
        req.body.league = {
            id: league._id.toString(),
            name: league.name
        }        
    
        let team = await Team.create(req.body);
    
        res.status(200).json({
            success: true,
            data: team
        });

        // sendPopulatedResponse(team, 200, res);
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse(`Server error`, 500));
    }


});

//@desc     Update a team
//@route    PUT /api/v1/teams/:id
//@access   Private - logged in user
exports.updateTeam = asyncHandler(async (req, res, next) => {
    let team = await Team.findById(req.params.id);
    if(!team){
        return next(new ErrorResponse(`Team with ID ${req.params.id} not found`, 404));
    }

    if(req.body.fights){
        return next(new ErrorResponse(`Cannot update team fights`, 400));
    }

    if(req.body.league){
        let league = League.findOne({ name: req.body.league });
        if(!league) {
            return next(new ErrorResponse(`Cannot find league with name ${req.body.league}`, 404));
        }
        req.body.league = {
            id: league._id,
            name: league.name
        }
    }
    
    team = await Team.findByIdAndUpdate(req.params.id, req.body, {new: true});

    //trigger the pre save hook to update fullName
    await team.save();
    
    let reqResObj = {
        req,
        res
    }

    sendPopulatedResponse(reqResObj, team, 200)
});


//@desc     Delete a team by ID
//@route    DELETE /api/v1/teams/:id
//@access   Private - SUPER-ADMIN
exports.deleteTeam = asyncHandler(async (req, res, next) => {
    let team = await Team.findById(req.params.id);
    if(!team){
        return next(new ErrorResponse(`Team with ID of ${req.params.id} Not Found`, 404));
    }

    Team.findByIdAndDelete(req.params.id);

    //no need to delete a team
    res.status(200).json({
        success: true,
        message: `Team with ID of ${req.params.id} has been removed from Database`
    });
}); 

const sendPopulatedResponse = asyncHandler(async function (reqResObj, team, statusCode){

    //Must send season (1960-1961) to get populated response
    let fightDocumentArray = await Fight.find({
        '_id': { $in: 
            team.fights
        },
        'season.season': reqResObj.req.query.season
    }).sort({'date': 1});

    //Get games
    let gameDocumentArray = await Game.find({
        '_id': { $in: 
            team.games
        },
        'season.season': reqResObj.req.query.season
    }).sort({'date': 1});

    team = await Team.findById(team._id).select('-games -fights');

    reqResObj.res.status(statusCode).json({
        success: true,
        data: {
            team,
            fights: fightDocumentArray,
            games: gameDocumentArray
        }  
    });
});