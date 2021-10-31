const mongoose = require('mongoose');

const FightSchema = new mongoose.Schema({
    teams: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Team',
        required: [true, 'Please Add teams']
    },
    players: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Player',
        required: [true, 'Please add players']
    },
    season: {
        type: String,
        required: [true, 'Please add a season']
    },
    league: {
        type: String,
        required: [true, 'Please add a season']
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

