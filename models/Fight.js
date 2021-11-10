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
        type: String,
        default: 'N/A'
    },
    punches: {
        type: String,
        default: 'N/A'
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

FightSchema.post('save', async function(next) {
    let season = await Season.findById(this.season);
    season.fights.push(this._id);
    season.save();

    let league = await League.findById(this.league);
    league.fights.push(this._id);
    league.save();

    // console.log(this.players);

    this.players.forEach(async(element) => {
        let player = await Player.findById(element);
        player.fights.push(this._id);
        player.save();
        // console.log(player);
    });

    this.teams.forEach(async(element) => {
        let team = await Team.findById(element);
        team.fights.push(this._id);
        team.save();
    });
    
    // next();
});


module.exports = mongoose.model('Fight', FightSchema);

