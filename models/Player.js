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
    },
    draw: {
        type: Number,
        default: 0
    },
    unfairTally: {
        type: Number,
        default: 0
    },
    funRating: {
        type: Number,
        default: 0
    },
    height: {
        type: String
    },
    weight: {
        type: String 
    }
});

module.exports = mongoose.model('Player', PlayerSchema);