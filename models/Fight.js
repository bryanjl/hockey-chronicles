const mongoose = require('mongoose');

const League = require('../models/League');
const Season = require('../models/Season');
const Team = require('../models/Team');
const Player = require('../models/Player');
const req = require('express/lib/request');

const FightSchema = new mongoose.Schema({
    game: {
        type: mongoose.Schema.ObjectId,
        ref: 'Game'
    },
    teams: {
        type: [Object]
    },
    players: {
        type: [Object]
    },
    season: {
        type: Object
    },
    league: {
        type: Object
    },
    date: {
        type: Date,
        required: [true, 'Please add a date']
    },
    comments: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Comment'
    },
    description: {
        type: String,
        default: ''
    },
    eventDescription: {
        type: String,
        default: ''
    },
    outcome: {
        type: Object
    },
    videoLink: {
        type: String,
        default: ''
    },
    gameType: {
        type: String,
        enum: ['Regular', 'Round 1', 'Preseason', 'Quarter Final', 'Semi Final', 'Final'],
        default: 'Regular'
    },
    fightType: {
        type: String,
        enum: ['Rough', 'Cheap', 'Brawl', 'Refused', 'Hit', 'Fight', 'Almost', 'Event'],
        default: 'Fight'
    },
    actionRating: {
        type: Object
    },
    unfair: {
        type: Boolean,
        default: false
    },
    winBy: {
        type: Object
    },
    time: {
        type: String,
        default: "00:00"
    },  
    createdAt: {
        type: Date,
        default: Date.now()
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    }
});


//saving references of created fights to other collections(season, league, player, etc)
    //references to models done in createFight helper

//update the outcome results based on votes
FightSchema.methods.updateOutcome = async function(reqOutcome) {
    try {
        //get the keys from req.outcome
        let reqObjKeys = Object.keys(reqOutcome);

        //get players
        let playerIds = reqObjKeys.filter(key => {
            if(key === 'draw'){
                return false;
            }
            return true;
        });
        let player1 = await Player.findById(playerIds[0]);
        let player2 = await Player.findById(playerIds[1]);
        
        //get the request outcome winner;
        let reqOutcomeValue = 0;
        let reqOutcomeWinner;
        for(let i = 0; i < reqObjKeys.length; i++){
            if(reqOutcome[reqObjKeys[i]] > reqOutcomeValue){
                reqOutcomeWinner = reqObjKeys[i];
                reqOutcomeValue = reqOutcome[reqObjKeys[i]];
            }
        }
        
        //check if initial state
        if(!this.outcome.winner){
            //draw recieves the vote
                //player 1 gets +1 draw
                //player2 gets +1 draw
                //make a new field for draw to keep in outcome object
            if(reqOutcomeWinner === 'draw'){
                player1.draws += 1;
                player2.draws += 1;
                player1.markModified('draws');
                player2.markModified('draws');
                await player1.save();
                await player1.save();
                reqOutcome.winner = 'draw';
                this.outcome = reqOutcome;
                return;
            }
            //player recieves vote
                //player who win get +1 win
                //player who loses gets +1 loss
                //make a new field for the winner keep in outcome object
            if(player1._id.toString() === reqOutcomeWinner){
                player1.wins += 1;
                player1.markModified('wins');
                player2.losses += 1;
                player2.markModified('losses');
                await player1.save();
                await player2.save();
                reqOutcome.winner = reqOutcomeWinner;
                this.outcome = reqOutcome;
                return;
            } else {
                player2.wins += 1;
                player2.markModified('wins');
                player1.losses += 1;
                player1.markModified('losses');
                await player1.save();
                await player2.save();
                reqOutcome.winner = reqOutcomeWinner;
                this.outcome = reqOutcome;
                return;
            }
        } else { //not initial state
            //check if it's same state (same winner, loser)
                //do nothing -> no change to players
            if(this.outcome.winner === reqOutcomeWinner){
                reqOutcome.winner = this.outcome.winner;
                this.outcome = reqOutcome;
                return;
            }
            //check if there is a tie in the request outcome object
            let tie = false;
            for(let i = 0; i < reqObjKeys.length; i++){
                if(reqOutcome[reqObjKeys[i]] === reqOutcomeValue && reqObjKeys[i] !== reqOutcomeWinner){
                    tie = true;
                }
            }
            //if tie then return and do nothing
            if(tie){
                reqOutcome.winner = this.outcome.winner;
                this.outcome = reqOutcome;
                return;
            }

            //new 'draw' winner
                //check against field in outcome obj (winner)
                //previous player winner gets -1 wins and +1 draws
                //previous player loser gets -1 losses and +1 draws
                //update field (winner) in outcome obj -> should be 'draw'
            if(reqOutcomeWinner === 'draw'){
                if(this.outcome.winner === player1._id.toString()){
                    player1.wins -= 1;
                    player1.draws += 1;
                    player1.markModified('draws');
                    player1.markModified('wins');
                    player2.losses -= 1;
                    player2.draws += 1;
                    player2.markModified('losses');
                    player2.markModified('draws');
                    await player1.save();
                    await player2.save();
                    reqOutcome.winner = 'draw';
                    this.outcome = reqOutcome;
                    return;
                } else {
                    player2.wins -= 1;
                    player2.draws += 1;
                    player2.markModified('draws');
                    player2.markModified('wins');
                    player1.losses -= 1;
                    player1.draws += 1;
                    player1.markModified('losses');
                    player1.markModified('draws');
                    await player1.save();
                    await player2.save();
                    reqOutcome.winner = 'draw';
                    this.outcome = reqOutcome;
                    return; 
                }  
            } else {
                //previous state was draw
                    //check against field in outcome obj (winner)
                    //new player winner gets +1 wins and -1 draws
                    //new loser player gets +1 losses and -1 draws
                    //update field (winner) in outcome obj
                if(this.outcome.winner === 'draw'){
                    player1.draws -= 1;
                    player2.draws -= 1;
                    player1.markModified('draws');
                    player2.markModified('draws');
                    if(reqOutcomeWinner === player1._id.toString()){
                        player1.wins += 1;
                        player2.losses += 1;
                        player1.markModified('wins');
                        player2.markModified('losses');
                    } else {
                        player2.wins += 1;
                        player1.losses += 1;
                        player2.markModified('wins');
                        player1.markModified('losses');
                    }
                    reqOutcome.winner = reqOutcomeWinner;
                    this.outcome = reqOutcome;
                    await player1.save();
                    await player2.save();
                    return;
                } else {
                    //previous state was other player?
                        //check against field in outcome obj (winner)
                        //new player winner gets +1 win and -1 losses
                        //new player loser gets +1 losses and -1 wins
                        //update field (winner) in outcome obj
                    if(reqOutcomeWinner === player1._id.toString()){
                        player1.wins += 1;
                        player1.losses -= 1;
                        player1.markModified('wins');
                        player1.markModified('losses');
                        player2.wins -= 1;
                        player2.losses += 1;
                        player2.markModified('wins');
                        player2.markModified('losses');
                    } else {
                        player2.wins += 1;
                        player2.losses -= 1;
                        player2.markModified('wins');
                        player2.markModified('losses');
                        player1.wins -= 1;
                        player1.losses += 1;
                        player1.markModified('wins');
                        player1.markModified('losses');
                    }
                    reqOutcome.winner = reqOutcomeWinner;
                    this.outcome = reqOutcome;
                    await player1.save();
                    await player2.save();
                    return;
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}

FightSchema.methods.updateActionRating = async function(newScore) {
    let currAverage = this.actionRating.average;
    let votes = this.actionRating.votes;

    currAverage = ((currAverage * votes) + newScore) / (votes + 1);

    this.actionRating.average = currAverage.toFixed(2);
    this.actionRating.votes += 1;

    let player1 = await Player.findById(this.players[0].id);
    let player2 = await Player.findById(this.players[1].id);

    player1.updateActionRating(currAverage);
    player2.updateActionRating(currAverage);

    player1.markModified('actionRating');
    player2.markModified('actionRating');
    await player1.save();
    await player2.save();
    // console.log(player1, player2);
}

FightSchema.methods.updateUnfair = async function(newUnfair){
    // console.log(this.unfair, newUnfair);

    if(this.unfair === newUnfair){
        // console.log('here');
        return;
    }
    
    this.unfair = newUnfair;

    let player1 = await Player.findById(this.players[0].id);
    let player2 = await Player.findById(this.players[1].id);

    if(newUnfair){
        player1.unfairTally += 1;
        player2.unfairTally += 1;
    } else {
        if(player1.unfairTally > 0){
            player1.unfairTally -= 1;
        }
        if(player2.unfairTally > 0){
            player2.unfairTally -= 1;
        }    
    }

    await player1.save();
    await player2.save();
}

//THIS NEEDS CHANGING SINCE EMBEDDING DOCUMENTS INSTEAD OF REFERENCING PLAYERS
FightSchema.methods.updatePlayers = async function(playersToChange){
    //get player that isn't changing
    let playersArr = this.players;
    let index = playersArr.indexOf(playersToChange[0]);
    if(index > -1){
        playersArr.splice(index, 1);
    }
    let otherPlayer = playersArr[0];

    //stats obj to update players/fight
    let stats = {
        wins: 0,
        losses: 0,
        draw: 0
    };

    //unfair tally to change players
    let unfairTally;
    this.unfair ? unfairTally = 1 : unfairTally = 0;
    stats.unfairTally = unfairTally;

    //actionRating
    stats.actionRating = this.actionRating.average;
    stats.votes = this.actionRating.votes;

    //Win loss or draw
    if(this.outcome[this.players[0]] === this.outcome[this.players[1]]){
        stats.draw = 1;
    } else if(this.outcome[playersToChange[0]] > this.outcome[otherPlayer]){
        stats.wins = 1;
    } else {
        stats.losses = 1;
    }

    //outcome
    stats.outcome = this.outcome[playersToChange[[0]]];

    //get Players
    let playerToRemove = await Player.findById(playersToChange[0]);
    let playerToAdd = await Player.findById(playersToChange[1]);

    //update the outcome freq counter
    delete this.outcome[playersToChange[0]];
    this.outcome[playersToChange[1]] = stats.outcome;

    //change players stats
    //wins-loss-draw
    playerToRemove.wins += -stats.wins;
    playerToRemove.losses += -stats.losses;
    playerToRemove.draw += -stats.draw;

    playerToAdd.wins += stats.wins;
    playerToAdd.losses += stats.losses;
    playerToAdd.draw += stats.draw;

    //player's action rating
    //actionrating is alrady averaged no need to adjust votes
    await playerToRemove.updateActionRating(-stats.actionRating);
    await playerToAdd.updateActionRating(stats.actionRating);

    playerToAdd.markModified('actionRating');
    playerToRemove.markModified('actionRating');

    //unfair tally
    playerToRemove.unfairTally += -stats.unfairTally;
    playerToAdd.unfairTally += stats.unfairTally;

    //player's fights array
    playerToAdd.fights.push(this._id);
    let fightIndex = playerToRemove.fights.indexOf(this._id);
    playerToRemove.fights.splice(fightIndex, 1);
    playerToAdd.markModified('fights');
    playerToRemove.markModified('fights');

    //change the fights player array
    this.players = [otherPlayer, playersToChange[1]];
    
    //save players
    await playerToRemove.save();
    await playerToAdd.save();
}

//THIS NEEDS CHANGING SINCE EMBEDDING DOCUMENTS INSTEAD OF REFERENCING TEAMS
FightSchema.methods.updateTeams = async function(newTeams){
    //get teams
    let teamToChange = await Team.findById(newTeams[0]);
    let teamToAdd = await Team.findById(newTeams[1]);

    // console.log(teamToChange, teamToAdd);

    //remove fight from team.fights array
    let fightIndex = teamToChange.fights.indexOf(this._id);
    teamToChange.fights.splice(fightIndex, 1);

    //add fight to team.fights
    teamToAdd.fights.push(this._id);

    //mark modified and save
    teamToAdd.markModified('fights');
    teamToChange.markModified('fights');

    await teamToAdd.save();
    await teamToChange.save();

    //update this.teams
    let teamIndex = this.teams.indexOf(newTeams[0]);
    this.teams[teamIndex] = newTeams[1];
}

//THIS NEEDS CHANGING SINCE EMBEDDING DOCUMENTS INSTEAD OF REFERENCING SEASON
FightSchema.methods.updateSeason = async function(newSeasonId){
    let currSeason = await Season.findById(this.season);

    let fightIndex = currSeason.fights.indexOf(this._id);
    currSeason.fights.splice(fightIndex, 1);
    currSeason.markModified('fights');
    await currSeason.save();

    let newSeason = await Season.findById(newSeasonId);
    newSeason.fights.push(this._id);
    newSeason.markModified('fights');
    await newSeason.save();

    this.season = newSeason._id;
}

//THIS NEEDS CHANGING SINCE EMBEDDING DOCUMENTS INSTEAD OF REFERENCING LEAGUE
FightSchema.methods.updateLeague = async function(newLeagueId){
    let currLeague = await League.findById(this.league);

    let fightIndex = currLeague.fights.indexOf(this._id);
    currLeague.fights.splice(fightIndex, 1);
    currLeague.markModified('fights');
    await currLeague.save();

    let newLeague = await League.findById(newLeagueId);
    newLeague.fights.push(this._id);
    newLeague.markModified('fights');
    await newLeague.save();

    this.league = newLeague._id;
}

module.exports = mongoose.model('Fight', FightSchema);