const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    date: {
        type: Date
    },
    gameType: {
        type: String,
        enum: ['Regular', 'Round 1', 'Preseason', 'Quarter Final', 'Semi Final', 'Final'],
        default: 'Regular'
    },
    fights: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Fight'
    },
    league: {
        type: mongoose.Schema.ObjectId,
        ref: 'League'
    },
    season: {
        type: mongoose.Schema.ObjectId,
        ref: 'Season'
    },
    teams: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Team'
    },
    comments: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Comment'
    }
});

module.exports = mongoose.model('Game', GameSchema);