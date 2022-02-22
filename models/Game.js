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

GameSchema.methods.updateTeams = async function(reqTeams) {
    try {
        //get current teams
        let currTeams = [...this.teams];
        // console.log(currTeams);
        let newTeams = [...reqTeams];
        let newTeam;
        //figure out which team is being changed
        //reqTeams should will hgave the team that needs to be changed
        for(let i=0; i < reqTeams.length; i++){
            if(reqTeams[i].id !== currTeams[0].id.toString() && reqTeams[i].id !== currTeams[1].id.toString()){
                // console.log('here')
                newTeam = reqTeams[i];
                // newTeam = reqTeams.splice(i, 1);
            }            
        }
        for(let i=0; i < currTeams.length; i++){
            if(currTeams[i].id.toString() !== reqTeams[0].id && currTeams[i].id.toString() !== reqTeams[1].id){
                // console.log('here')
                oldTeam = currTeams[i];
                // newTeam = reqTeams.splice(i, 1);
            }            
        }
        // console.log(newTeam, oldTeam);
        let teamToChange = await Team.findById(oldTeam.id);
        //remove game from team being changed record
        let newGames = teamToChange.games.filter(game => {
            game !== this._id;
        });
        teamToChange.games = newGames;
        teamToChange.markModified('games');
        // await teamToChange.save();
        //remove the fights from team being changed
        for(let i=0; i<this.fights.length; i++){
            if(teamToChange.fights.some(fight => this.fights.includes(fight))){
                teamToChange.fights.splice(i, 1);
            }
        }
        teamToChange.markModified('fights');
        await teamToChange.save();
        //add fights to the new team
        let addedTeam = await Team.findById(newTeam.id);
        this.fights.forEach(fight => {
            addedTeam.fights.push(fight);
        });
        addedTeam.markModified('fights');
        await addedTeam.save();

        //add the game to the new team
        addedTeam.games.push(this._id);

        console.log('new teams',newTeams);

        //add new team to the game
        this.teams = newTeams;
    } catch (error) {
        console.log(error);
    }
}

GameSchema.methods.updateSeason = async function(reqSeason) {
    // console.log(this.season)
    try {
        let currSeason = await Season.findById(this.season.id);
        let newSeasonGames = currSeason.games.filter(game => {
            game.toString() !== this._id;        
        });

        currSeason.games = newSeasonGames;
        currSeason.markModified('games');
        await currSeason.save();

        let newSeason = await Season.findOne({ season: `${reqSeason}` });
        newSeason.games.push(this._id);
        newSeason.markModified('games');
        await newSeason.save();
        console.log(newSeason);

        this.season = {
            id: newSeason._id,
            season: newSeason.season
        }
    } catch (error) {
        console.log(error);
    }
}


module.exports = mongoose.model('Game', GameSchema);