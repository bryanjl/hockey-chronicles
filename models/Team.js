const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add team name']
    },
    league: {
        type: String,
        required: [true, 'Please add a league for the team'],
        default: 'N/A'
    },
    fights: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Fight'
    }
});

module.exports = mongoose.model('Team', TeamSchema);