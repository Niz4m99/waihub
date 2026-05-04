const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    reply: {
        type: String,
        required: true
    },
    latency: {
        type: String
    },
    time: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChatLog', chatLogSchema);