const asyncHandler = require('./async');
// const ErrorResponse = require('../utils/ErrorResponse');

//models
const Fight = require('../models/Fight');
const Player = require('../models/Player');

//update the embedded player data in the fight record
exports.updatePlayerData = asyncHandler(async (req, res, next) => {
    try {
        let fight = await Fight.findById(req.params.id);
        
        let players = [];
        let player1 = await Player.findById(fight.players[0].id);
        let player1Info = {
            id: player1._id,
            firstName: player1.firstName,
            lastName: player1.lastName,
            position: player1.position,
            wins: player1.wins,
            losses: player1.losses,
            draws: player1.draws,
            height: player1.height,
            weight: player1.weight,
            shoots: player1.shoots
        }
        players.push(player1Info);

        let player2 = await Player.findById(fight.players[1].id);
        let player2Info = {
            id: player2._id,
            firstName: player2.firstName,
            lastName: player2.lastName,
            position: player2.position,
            wins: player2.wins,
            losses: player2.losses,
            draws: player2.draws,
            height: player2.height,
            weight: player2.weight,
            shoots: player2.shoots
        }
        players.push(player2Info);
        
        fight.players = players;
        fight.markModified('players');
        await fight.save();

        next();

    } catch (error) {
        console.log(error)
        next();
    }
    
    
});