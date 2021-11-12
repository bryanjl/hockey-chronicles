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
FightSchema.post('save', async function(next) {
    //create reference of fight for season
    let season = await Season.findById(this.season);
    season.fights.push(this._id);
    season.save();

    //create reference of fight for league
    let league = await League.findById(this.league);
    league.fights.push(this._id);
    league.save();

    //create reference of fight for players
    this.players.forEach(async(element) => {
        let player = await Player.findById(element);
        player.fights.push(this._id);
        player.save();
    });

    //create reference of fight for teams
    this.teams.forEach(async(element) => {
        let team = await Team.findById(element);
        team.fights.push(this._id);
        team.save();
    });
});

//update the outcome results based on votes
FightSchema.methods.updateOutcome = async function(player1, player2) {
    //player1 gets +1 vote
    //player2 gets 0 vote

    //check to see current winner before update
    let currentWinner;

    if(this.outcome[player1] === this.outcome[player2]){
        currentWinner = "";
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
        newWinner = "";
    } else if(this.outcome[player1] > this.outcome[player2]){
        newWinner = player1;
    } else {
        newWinner = player2;
    }

    //check if winner outcome has changed
    if(currentWinner === newWinner){
        //if currentWinner is equal to newWinner no change needed to player stats
        console.log('No change');
        return;
    } else {        
        //if there is a change only player1 can become winner
        let winningPlayer = await Player.findById(player1);
        // console.log(winningPlayer);

        //UPDATE winning player stats


        let losingPlayer = await Player.findById(player2);
        // console.log(losingPlayer);

        //UPDATE losing player stats
        
        //update player.wins stats +1 for winner -1 for loser
    }
}


module.exports = mongoose.model('Fight', FightSchema);

