//middleware & utils
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
//models
const League = require('../models/League');
const Team = require('../models/Team');

//@desc     Get all Teams
//@route    GET /api/v1/teams/
//@access   Public
exports.getAllTeams = asyncHandler(async (req, res, next) => {
    //use advanced results middleware
    res.status(200).json(res.advancedResults);
});

//@desc     Get a team by ID
//@route    GET /api/v1/teams/:id
//@access   Public
exports.getTeam = asyncHandler(async (req, res, next) => {
    let team = await Team.findById(req.params.id);
    if(!team){
        return next(new ErrorResponse(`Team with ID ${req.params.id} Not Found`, 404));
    }

    sendPopulatedResponse(team, 200, res);
});

//@desc     Create a team
//@route    POST /api/v1/teams/
//@access   Private - logged in user
exports.createTeam = asyncHandler(async (req, res, next) => {
    let league = await League.findOne({ name: req.body.league.toUpperCase() });
    if(!league){
        return next(new ErrorResponse(`League ${req.body.league} Not found`, 400));
    }

    req.body.league = league._id;
    
    let team = await Team.create(req.body);

    sendPopulatedResponse(team, 200, res);
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

    team = await Team.findByIdAndUpdate(req.params.id, req.body);

    sendPopulatedResponse(team, 200, res);
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

const sendPopulatedResponse = asyncHandler(async function (team, statusCode, res){
    team = await Team.findById(team._id)
        .populate([
            {
                path: 'league',
                select: 'name'
            },
            {
                path: 'fights',
                populate: [
                    { 
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
                    }
                ]
            }
        ]);

    res.status(statusCode).json({
        success: true,  
        data: team
    });
});