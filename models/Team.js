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
    }
});

TeamSchema.pre('save', async function(next) {
    this.fullName = `${this.city} ${this.name}`;
    next();
});

TeamSchema.pre('validate', async function(next) {
    console.log(this.city, this.name)
    this.fullName = `${this.city} ${this.name}`;
    // next();
});

TeamSchema.methods.setFullName = (city, name) => {
    console.log(this.city, this.name);
    this.fullName = `${city} ${name}`;
}

module.exports = mongoose.model('Team', TeamSchema);