const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    thread: {
        type: mongoose.Schema.ObjectId,
        ref: 'Forum'
    },
    body: {
        type: String
    },
    createdBy: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Post', PostSchema);