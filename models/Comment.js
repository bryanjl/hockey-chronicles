const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    body: {
        type: String,
        required: [true, 'Please add a comment']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    username: {
        type: String
    },
    parentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Comment',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Comment', CommentSchema);