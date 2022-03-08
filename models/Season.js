const mongoose = require('mongoose');

const SeasonSchema = new mongoose.Schema({
    season: {
        type: String,
        required: [true, 'Please add a season']
    },
    games: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Game'
    },
    fights: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Fight'
    }
});

module.exports = mongoose.model('Season', SeasonSchema);