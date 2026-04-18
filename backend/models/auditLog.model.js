const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['VENDOR_APPROVE', 'VENDOR_REJECT', 'USER_BLOCK', 'SYSTEM_CONFIG_CHANGE', 'VEHICLE_DELETE']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    targetType: {
        type: String,
        required: true,
        enum: ['Vendor', 'User', 'Vehicle']
    },
    details: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
