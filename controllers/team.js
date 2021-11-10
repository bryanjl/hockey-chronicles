const asyncHandler = require('../middleware/async');
const League = require('../models/League');
const Team = require('../models/Team');

//@desc     Get all Teams
//@route    GET /api/v1/teams/
//@access   Public
exports.getAllTeams = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for getting all Teams`
    });
});

//@desc     Get a team by ID
//@route    GET /api/v1/teams/:id
//@access   Public
exports.getTeam = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for getting a team by id of ${req.params.id}`
    });
});

//@desc     Create a team
//@route    POST /api/v1/teams/
//@access   Private - logged in user
exports.createTeam = asyncHandler(async (req, res, next) => {
    let league = await League.findOne({ name: req.body.league });

    //!!!!!!!!!!!!!!Need validation && error checking!!!!!!!!!!!!!!!!!

    req.body.league = league._id;
    
    let team = await Team.create(req.body);

    res.status(200).json({
        success: true,
        data: team
    });
});

//@desc     Update a team
//@route    PUT /api/v1/teams/:id
//@access   Private - logged in user
exports.updateTeam = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for updating a team with id of ${req.params.id}`
    });
});

//@desc     Delete a team by ID
//@route    DELETE /api/v1/teams/:id
//@access   Private - SUPER-ADMIN
exports.deleteTeam = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for deleting a team with id of ${req.params.id}`
    });
}); 