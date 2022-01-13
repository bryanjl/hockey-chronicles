const mongoose = require('mongoose');

const SeasonSchema = new mongoose.Schema({
    season: {
        type: String,
        required: [true, 'Please add a season']
    },
    fights: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Fight'
    },
    games: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Game'
    }
});

module.exports = mongoose.model('Season', SeasonSchema);