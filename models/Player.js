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
    actionRating: {
        type: Object
    },
    height: {
        type: String
    },
    weight: {
        type: String 
    }
});

PlayerSchema.methods.updateActionRating = async function(newScore){
    //new Vites needs to be fixed.
    let currAverage = this.actionRating.average;
    let votes = this.actionRating.votes;

    currAverage = ((currAverage * votes) + newScore) / (votes + 1);

    this.actionRating.average = currAverage.toFixed(2);
    this.actionRating.votes += 1;
}

module.exports = mongoose.model('Player', PlayerSchema);