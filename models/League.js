const mongoose = require('mongoose');

const LeagueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name for the League']
    },
    description: {
        type: String,
        default: ''
    },
    fights: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Fight'
    },
    games: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Game'
    },
    leagueImageFile: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('League', LeagueSchema);