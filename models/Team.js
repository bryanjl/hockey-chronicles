const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add team name'],
        unique: true
    },
    city: {
        type: String,
        required: [true, "Please add team's city"]
    },
    league: {
        type: mongoose.Schema.ObjectId,
        ref: 'League'
    },
    fights: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Fight'
    }
});

module.exports = mongoose.model('Team', TeamSchema);