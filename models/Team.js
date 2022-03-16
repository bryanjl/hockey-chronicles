const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    fullName: {
        type: String
    },
    name: {
        type: String,
        required: [true, 'Please add team name'],
    },
    city: {
        type: String,
        required: [true, "Please add team's city"]
    },
    league: {
        type: Object
    },
    fights: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Fight'
    },
    games: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Game'
    },
    yearsActive: {
        type: [String]
    },
    teamImageFile: {
        type: String
    }
});

TeamSchema.pre('save', async function(next) {
    this.fullName = `${this.city} ${this.name}`;
    next();
});

module.exports = mongoose.model('Team', TeamSchema);