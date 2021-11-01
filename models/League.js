const mongoose = require('mongoose');

const LeagueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name for the League']
    },
    fights: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Fight'
    }
});

module.exports = mongoose.model('League', LeagueSchema);