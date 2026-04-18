const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sender: {
        type: String,
        enum: ['user', 'ai', 'support'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    context: {
        type: mongoose.Schema.Types.Mixed // Store related bookingId or vehicleId if applicable
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
