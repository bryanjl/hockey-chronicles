const mongoose = require('mongoose');

const ThreadSchema = new mongoose.Schema({
    forum: {
        type: mongoose.Schema.ObjectId,
        ref: 'Forum'
    },
    posts: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Post'
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

module.exports = mongoose.model('Thread', ThreadSchema);