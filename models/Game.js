const mongoose = require('mongoose');

//models
const Team = require('../models/Team');
const Season = require('../models/Season')

const GameSchema = new mongoose.Schema({
    date: {
        type: Date
    },
    gameType: {
        type: String,
        default: 'Regular'
    },
    round: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ""
    },
    fights: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Fight'
    },
    league: {
        type: Object
    },
    season: {
        type: Object
    },
    teams: {
        type: [Object]
    },
    homeTeam: {
        type: mongoose.Schema.ObjectId,
        ref: 'Team'
    },
    comments: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Comment'
    }
});

GameSchema.methods.updateTeamsFights = async function(removedTeamId, addedTeamId, newTeams) {
    try {
        // console.log(newTeams) 
        let teamToChange = await Team.findById(removedTeamId);
        //remove the fights from team being changed
        for(let i=0; i<this.fights.length; i++){
            if(teamToChange.fights.some(fight => this.fights.includes(fight))){
                teamToChange.fights.splice(i, 1);
            }
        }
        teamToChange.markModified('fights');
        await teamToChange.save();
        //add fights to the new team
        let addedTeam = await Team.findById(addedTeamId);
        this.fights.forEach(fight => {
            addedTeam.fights.push(fight);
        });
        addedTeam.markModified('fights');
        await addedTeam.save();

        //add new team to the game
        this.teams = newTeams;
    } catch (error) {
        console.log(error);
    }
}

GameSchema.methods.updateSeason = async function() {
    // console.log(this.season)
    try {
        let currSeason = await Season.findById(this.season.id);
        let newSeasonGames = currSeason.games.filter(game => {
            game.toString() !== this._id;        
        });

        currSeason.games = newSeasonGames;
        currSeason.markModified('games');
        await currSeason.save();

    } catch (error) {
        console.log(error);
    }
}


module.exports = mongoose.model('Game', GameSchema);