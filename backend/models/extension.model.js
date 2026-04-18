const mongoose = require('mongoose');

const extensionRequestSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    newEndDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String
    },
    additionalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    decisionDate: {
        type: Date
    },
    decisionReason: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ExtensionRequest', extensionRequestSchema);
