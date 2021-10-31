const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add player name']
    }
});

module.exports = mongoose.model('Player', PlayerSchema);