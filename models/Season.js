const mongoose = require('mongoose');

const SeasonSchema = new mongoose.Schema({
    season: {
        type: String,
        required: [true, 'Please add a season']
    },
    games: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Game'
    }
});

module.exports = mongoose.model('Season', SeasonSchema);