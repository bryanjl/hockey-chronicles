const mongoose = require('mongoose');

const ForumSchema = new mongoose.Schema({
    topic: {
        type: mongoose.Schema.ObjectId,
        ref: 'Topic'
    },
    thread: {
        type: mongoose.Schema.ObjectId,
        ref: 'Thread'
    },
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

module.exports = mongoose.model('Forum', ForumSchema);