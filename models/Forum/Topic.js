const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
    forum: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Forum'
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

module.esports = mongoose.model('Topic', TopicSchema);