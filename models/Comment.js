const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: [true, 'Please add a comment']
    },
    user: {
        type: mongoose.Schema.ObjectId
        // ,
        // required: [true, 'Please log in to post comment']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Comment', CommentSchema);