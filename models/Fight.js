const mongoose = require('mongoose');

const League = require('../models/League');
const Season = require('../models/Season');
const Team = require('../models/Team');
const Player = require('../models/Player');

const FightSchema = new mongoose.Schema({
    teams: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Team'
    },
    players: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Player'
    },
    season: {
        type: mongoose.Schema.ObjectId,
        ref: 'Season'
    },
    league: {
        type: mongoose.Schema.ObjectId,
        ref: 'League'
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
        type: String
    },
    outcome: {
        type: Object
    },
    videoLink: {
        type: String
    },
    gameType: {
        type: String,
        enum: ['Regular', 'Round 1', 'Preseason', 'Quarter Final', 'Semi Final', 'Final'],
        default: 'Regular'
    },
    fightType: {
        type: String,
        enum: ['Rough', 'Cheap', 'Brawl', 'Refused', 'Hit', 'Fight'],
        default: 'Fight'
    },
    actionRating: {
        type: Object
    },
    unfair: {
        type: Boolean,
        default: false
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
FightSchema.pre('save', async function(next) {
    if(this.isNew){
        //create reference of fight for season
        let season = await Season.findById(this.season);
        season.fights.push(this._id);
        await season.save();

        //create reference of fight for league
        let league = await League.findById(this.league);
        league.fights.push(this._id);
        await league.save();

        //create reference of fight for players
        this.players.forEach(async(element) => {
            let player = await Player.findById(element);
            player.fights.push(this._id);
            await player.save();
        });

        //create reference of fight for teams
        this.teams.forEach(async(element) => {
            let team = await Team.findById(element);
            team.fights.push(this._id);
            await team.save();
        });
    }
    next();
});

//update the outcome results based on votes
FightSchema.methods.updateOutcome = async function(player1, player2) {
    //player1 gets +1 vote
    //player2 gets 0 vote

    //check to see current winner before update
    let currentWinner;

    if(this.outcome[player1] === this.outcome[player2]){
        currentWinner = "hhh";
    } else if(this.outcome[player1] > this.outcome[player2]){
        currentWinner = player1;
    } else {
        currentWinner = player2;
    }

    //update outcome
    this.outcome[player1] += 1;

    //check to see which player is winner after update
    let newWinner;

    if(this.outcome[player1] === this.outcome[player2]){
        newWinner = "hhh";

        //if this is a draw
        let drawPlayer1 = await Player.findById(player1);
        let drawPlayer2 = await Player.findById(player2);

        drawPlayer1.draw += 1;
        if(drawPlayer1.losses > 0){
            drawPlayer1.losses -= 1;
        }
        drawPlayer1.save();

        
        drawPlayer2.draw += 1;
        if(drawPlayer2.wins > 0) {
            drawPlayer2.wins -= 1;
        }
        drawPlayer2.save();

        return;
    } else if(this.outcome[player1] > this.outcome[player2]){
        newWinner = player1;
    } else {
        newWinner = player2;
    }

    // console.log(currentWinner, newWinner);

    //check if winner outcome has changed
    if(currentWinner === newWinner){
        //if currentWinner is equal to newWinner no change needed to player stats
        // console.log('No change');
        return;
    } else {        
        //if there is a change only player1 can become winner
        let winningPlayer = await Player.findById(player1);
        
        //UPDATE winning player stats
        winningPlayer.wins += 1;
        if(winningPlayer.draw > 0){
            winningPlayer.draw -= 1;
        }
        
        if(winningPlayer.losses > 0){
            winningPlayer.losses -= 1;
        }
        
        await winningPlayer.save();

        let losingPlayer = await Player.findById(player2);

        //UPDATE losing player stats
        losingPlayer.losses += 1;
        if(losingPlayer.draw > 0){
            losingPlayer.draw -= 1;
        }
        
        if(losingPlayer.wins > 0){
            losingPlayer.wins -= 1;
        }

        await losingPlayer.save();
    }
}

FightSchema.methods.updateActionRating = async function(newScore) {
    
    let currAverage = this.actionRating.average;
    let votes = this.actionRating.votes;

    currAverage = ((currAverage * votes) + newScore) / (votes + 1);

    this.actionRating.average = currAverage.toFixed(2);
    this.actionRating.votes += 1;

    let player1 = await Player.findById(this.players[0]);
    let player2 = await Player.findById(this.players[1]);

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

    let player1 = await Player.findById(this.players[0]);
    let player2 = await Player.findById(this.players[1]);

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

