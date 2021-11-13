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
    },
    wins: {
        type: Number,
        default: 0
    },
    losses: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Player', PlayerSchema);