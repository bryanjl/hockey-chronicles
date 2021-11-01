const asyncHandler = require('../middleware/async');
const Fight = require('../models/Fight');
const Player = require('../models/Player');
const Team = require('../models/Team');

exports.getFight = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `route to get a fight from collection using ID of ${req.params.id}`
    })
    
    // let fight = await Fight.findById(req.params.id);

    // res.status(200).json({
    //     success: true,
    //     data: fight
    // });
});

exports.createFight = asyncHandler(async (req, res, next) => {
    // res.status(200).json({
    //     success: true,
    //     message: 'route to create a new fight'
    // })

    /////////////////////////////////////////////////////
    //check if player(s) exist -> ASSUMPTION 2 players
    //check if team(s) exist
    ////////////////////////////////////////////////////
    const createPlayer = async(elem) => {
        let player = await Player.findOne({ name: elem });

        if(!player){
            console.log('no player');
            player = await Player.create({ name: elem });
        }
        console.log(player);
    }


    let players = req.body.players;

    players.forEach(element => {
        element = element.toUpperCase();
        console.log(element);
        createPlayer(element);


    });




    let teams = req.body.teams;
    console.log(teams[0], teams[1]);
    // teams.forEach(element => {
    //     console.log(element);
    // });



    // let fight = await Fight.create(req.body);

    res.status(201).json({
        success: true
        // ,
        // data: fight
    });
});