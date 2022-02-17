//middleware
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/ErrorResponse');

//models
const Fight = require('../../models/Fight');
const Game = require('../../models/Game');
const Player = require('../../models/Player');

exports.createFight = asyncHandler(async (req) => {
    let fightInfo = {};
    
    fightInfo.league = req.body.league;
    fightInfo.season = req.body.season;
    fightInfo.game = req.body.game;

    //players - embed data
    if(req.body.players){
        let players = [];
        let player1 = await Player.findById(req.body.players[0]._id);
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
        let player2 = await Player.findById(req.body.players[1]._id);
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
        players.push(player1Info);
        players.push(player2Info);
        fightInfo.players = players;

        //outcome frequency counter for voting
        let outcome = {};
        fightInfo.players.forEach(element => {
            outcome[element.id] = 1;
        });
        outcome.draw = 1;
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
    fightInfo.fightType = req.body.fightType;

    // create fight
    let fight = await Fight.create(fightInfo);

    if(!fight){
        return next(new ErrorResponse(`Unable to create fight - Server Error`, 500));
    }

    let game = await Game.findById(req.body.game);
    if(!game){
        return next(new ErrorResponse(`Server Error - Could not find game`, 500));
    }
    game.fights.push(fight._id);
    game.markModified('fights');
    await game.save();

    return fight;
});



    //  //if there are no players in the request skip creating the fight
    //  let fightInfo = {};

    //  //get objectID to save for relations 
    //  let leagueId = await League.findOne({  name: req.body.league.toUpperCase() });
    //  if(!leagueId){
    //      return next(new ErrorResponse('League not found', 404));
    //  } else {
    //      fightInfo.league = {
    //          id: leagueId._id,
    //          league: leagueId.name
    //      };
    //  }

    //  let seasonId = await Season.findOne({  season: req.body.season });
    //  if(!seasonId){
    //      return next(new ErrorResponse('Season not found - Check format (YYYY-YYYY)', 404));
    //  } else {
    //      fightInfo.season = {
    //          id: seasonId._id,
    //          season: seasonId.season
    //      };
    //  }

    //  //!!!Test for different number of players/wrong spelling etc
    //  //!!How to handle unknow players/fighters???
    //  let playersId = await Player.find({
    //      lastName: {
    //          $in: req.body.players
    //      }
    //  }, '_id');

    //  if(playersId.length === 0){
    //      return next(new ErrorResponse(`No players found`, 404));
    //  } else {
    //      let players = [];
    //      let player1 = await Player.findById(playersId[0]._id);
    //      let player1Info = {
    //          id: player1._id,
    //          firstName: player1.firstName,
    //          lastName: player1.lastName,
    //          position: player1.position,
    //          wins: player1.wins,
    //          losses: player1.losses,
    //          draws: player1.draws,
    //          height: player1.height,
    //          weight: player1.weight,
    //          shoots: player1.shoots
    //      }
    //      players.push(player1Info);

    //      let player2 = await Player.findById(playersId[1]._id);
    //      let player2Info = {
    //          id: player2._id,
    //          firstName: player2.firstName,
    //          lastName: player2.lastName,
    //          position: player2.position,
    //          wins: player2.wins,
    //          losses: player2.losses,
    //          draws: player2.draws,
    //          height: player2.height,
    //          weight: player2.weight,
    //          shoots: player2.shoots
    //      }
    //      players.push(player2Info);

    //      // console.log(players)

    //      fightInfo.players = players;
    //  }
     

    //  let teamsId = await Team.find({
    //      city: {
    //          $in: req.body.teams
    //      }
    //  }, '_id');

    //  // console.log(teams);

    //  if(teamsId.length != 2){
    //      return next(new ErrorResponse(`Must have two teams`, 400));
    //  } else {
    //      //embed teams to fight document
    //      let teams = [];
    //      let team1 = await Team.findById(teamsId[0]._id);
    //      let  team1Info = {
    //          id: team1._id,
    //          name: team1.name,
    //          city: team1.city
    //      }
    //      teams.push(team1Info);
    //      let team2 = await Team.findById(teamsId[1]._id);
    //      let team2Info = {
    //          id: team2._id,
    //          name: team2.name,
    //          city: team2.city
    //      }
    //      teams.push(team2Info);

    //      // console.log(teams)

    //      fightInfo.teams = teams;
    //  }

    //  //outcome frequency counter for voting
    //  let outcome = {};
    //  fightInfo.players.forEach(element => {
    //      outcome[element.id] = 1;
    //  });
    //  outcome.draw = 1;
    //  //set outcome object to request body
    //  fightInfo.outcome = outcome;

    //  //action rating average - freq counter
    //  let actionRating = {
    //      average: 0,
    //      votes: 0
    //  };
    //  //set actionRating to request body
    //  fightInfo.actionRating = actionRating;    

    //  //Date of fight
    //  fightInfo.date = new Date(req.body.date);

    //  // create fight
    //  let fight = await Fight.create(fightInfo);

    //  if(!fight){
    //      return next(new ErrorResponse(`Unable to create fight - Server Error`, 500));
    //  }

    //  return fight;