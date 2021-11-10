const asyncHandler = require('../middleware/async');
const Fight = require('../models/Fight');
const League = require('../models/League');
const Season = require('../models/Season');
const Team = require('../models/Team');
const Player = require('../models/Player');
// const User = require('../models/User');
// const Comment = require('../models/Comment');

//@desc     Get a fight by ID
//@route    GET /api/v1/fights/:id
//@access   Public
exports.getFight = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `route to get a fight from collection using ID of ${req.params.id}`
    })
});

//@desc     Create a new fight
//@route    POST /api/v1/fights/
//@access   Private - logged in user
exports.createFight = asyncHandler(async (req, res, next) => {

    //!!!!!!!!!!!!!!!!!!!Need validations and checks!!!!!!!!!!!!!! 

    //get objectID to save for relations 
    req.body.league = await League.findOne({  name: req.body.league }, '_id' );
    req.body.season = await Season.findOne({  season: req.body.season }, '_id');
    
    req.body.players = await Player.find({
        lastName: {
            $in: req.body.players
        }
    }, '_id');

    req.body.teams = await Team.find({
        name: {
            $in: req.body.teams
        }
    }, '_id');

    //outcome frequency counter for voting
    let outcome = {};
    req.body.players.forEach(element => {
        //save as string for easy retrieval on frontend?? -> if change this must change updateOutcome method
        // let id = element.toString().match(/"(.*?)"/);
        outcome[element._id] = 0;
    });

    //set outcome object to request body
    req.body.outcome = outcome;

    //Date of fight
    req.body.date = new Date(req.body.date);

    // create fight
    let fight = await Fight.create(req.body);

    // fight.updateOutcome(req.body.players[0]._id, req.body.players[1]._id)

    //populate with data 
    fight = await Fight.findById(fight._id)
        .populate('league', 'name')
        .populate('season', 'season')
        .populate('players', 'firstName lastName')
        .populate('teams', 'city name');

    res.status(200).json({
        success: true,
        data: fight
    });
});

//@desc     Update a fight by ID
//@route    PUT /api/v1/fights/:id
//@access   Private - logged in user
exports.updateFight = asyncHandler(async (req, res, next) => {
    //get fight by ID
    let fight = await Fight.findById(req.params.id);
    if(!fight){
        //NEED PROPER ERROR HANDLING

        //error handling
        console.log(`no fight with ID of ${req.params.id}`);
    }

    //outcome update for fight winner
    //req.body.outcome MUST have player who recieves vote at position 0 index in array
    if(req.body.outcome){
        //update fight outcome
        fight.updateOutcome(req.body.outcome[0], req.body.outcome[1]);

        //mark modified to save
        fight.markModified('outcome');
    }

    fight.save();

    res.status(200).json({
        success: true,
        data: fight
    });
});

//@desc     Delete a fight by ID
//@route    DELETE /api/v1/fights/:id
//@access   Private - logged in user
exports.deleteFight = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for deleting a fight by id of ${req.params.id}`
    });
});

