const mongoose = require('mongoose');

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
        require: [true, 'Please add a date']
    },
    comments: {
        type: String
    },
    outcome: {
        type: String,
        required: [true, 'Please add an outcome'],
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


module.exports = mongoose.model('Fight', FightSchema);

