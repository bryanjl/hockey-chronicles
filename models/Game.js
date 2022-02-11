const mongoose = require('mongoose');

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


module.exports = mongoose.model('Game', GameSchema);