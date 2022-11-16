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
        type: String
    },
    description: {
        type: String
    },
    createdBy: {
        type: String
    },
    createdAt: {
        type: Date
    }
});

module.exports = mongoose.model('Forum', ForumSchema);