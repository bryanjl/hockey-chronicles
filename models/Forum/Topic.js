const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
    // forum: {
    //     type: [mongoose.Schema.ObjectId],
    //     ref: 'Forum'
    // },
    title: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    createdBy: {
        type: String,
        default: 'Anonymous'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Topic', TopicSchema);