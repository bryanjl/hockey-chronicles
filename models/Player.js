const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Please add player's first name"]
    },
    lastName: {
        type: String,
        required: [true, "Please add player's last name"]
    },
    position: {
        type: String,
        default: 'N/A'
    },
    fights: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Fight'
    }
});

module.exports = mongoose.model('Player', PlayerSchema);