//middleware
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/ErrorResponse');

//models
const Fight = require('../../models/Fight');
const Game = require('../../models/Game');
const Player = require('../../models/Player');
const Team = require('../../models/Team');
const Season = require('../../models/Season');
const League = require('../../models/League');

exports.createFight = asyncHandler(async (req) => {
    // console.log(req.body);
    let fightInfo = {};

    fightInfo.league = req.body.league;
    fightInfo.season = req.body.season;
    fightInfo.game = req.body.game;

    //players - embed data
    if(req.body.players){
        let players = [];
        let player1 = await Player.findById(req.body.players[0]._id);
        if(!player1){
            console.log('no player 1')
        }
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
            shoots: player1.shoots,
            teamId: req.body.players[0].teamId
        }
        let player2 = await Player.findById(req.body.players[1]._id);
        if(!player2){
            console.log('no player 2')
        }
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
            shoots: player2.shoots,
            teamId: req.body.players[1].teamId
        }
        players.push(player1Info);
        players.push(player2Info);
        fightInfo.players = players;
     
        //outcome frequency counter for voting
        let outcome = {};
        fightInfo.players.forEach(element => {
            outcome[element.id] = 0;
        });
        outcome.draw = 0;
        //set outcome object to request body
        fightInfo.outcome = outcome;
    }

    //teams
    fightInfo.teams = req.body.teams;

    //action rating average - freq counter
    let actionRating = {
        average: 0,
        votes: 0
    };
    //set actionRating to request body
    fightInfo.actionRating = actionRating;  

    //date of fight
    fightInfo.date = req.body.date;

    //time in game
    fightInfo.time = req.body.time;

    //link to youtube video
    fightInfo.videoLink = req.body.videoLink;

    //description of fight/event
    if(req.body.description){
        fightInfo.description = req.body.description;
    } else {
        fightInfo.eventDescription = req.body.eventDescription
    }

    //fightType
    if(!req.body.fightType){
        fightInfo.fightType = 'Fight';
    } else {
        fightInfo.fightType = req.body.fightType;
    }

    // create fight
    let fight = await Fight.create(fightInfo);

    if(!fight){
        return next(new ErrorResponse(`Unable to create fight - Server Error`, 500));
    }

    //add fight to game's fight array
    let game = await Game.findById(req.body.game);
    if(!game){
        return next(new ErrorResponse(`Server Error - Could not find game`, 500));
    }
    game.fights.push(fight._id);
    game.markModified('fights');
    await game.save();

    //add fight references to to the appropriate models
    await addReferenceToLeague(fightInfo.league.id, fight._id);
    // only add reference to pplayers if players are present
    if(fightInfo.players.length === 2){
        await addReferenceToPlayers(fightInfo.players, fight._id);
    }    
    await addReferenceToSeason(fightInfo.season.id, fight._id);
    await addReferenceToTeams(fightInfo.teams, fight._id);   

    return fight;
});

//methods to add fight to the proper models

//add fight to team's fight array
const addReferenceToTeams = asyncHandler(async(teams, fightId) => {
    try {
        let team1 = await Team.findById(teams[0].id);
        let team2 = await Team.findById(teams[1].id);

        team1.fights.push(fightId);
        team1.markModified('fights');
        await team1.save();

        team2.fights.push(fightId);
        team2.markModified('fights');
        await team2.save();
    } catch (error) {
        console.log(error);
    }
});

//add fight to each player's fight array
const addReferenceToPlayers = asyncHandler(async(players, fightId) => {
    try {
        let player1 = await Player.findById(players[0].id);
        let player2 = await Player.findById(players[1].id);

        player1.fights.push(fightId);
        player1.markModified('fights');
        await player1.save();

        player2.fights.push(fightId);
        player2.markModified('fights');
        await player2.save();
    } catch (error) {
        console.log(error);
    }
});

//add fight to season's fight array
const addReferenceToSeason = asyncHandler(async(seasonId, fightId) => {
    try {
        let season = await Season.findById(seasonId);
        season.fights.push(fightId);
        season.markModified('fights');
        await season.save();
    } catch (error) {
        console.log(error);
    }
});

//add fight to league's fight array
const addReferenceToLeague = asyncHandler(async(leagueId, fightId) => {
    try {
        let league = await League.findById(leagueId);
        league.fights.push(fightId);
        league.markModified('fights');
        await league.save();
    } catch (error) {
        console.log(error);
    }
});
