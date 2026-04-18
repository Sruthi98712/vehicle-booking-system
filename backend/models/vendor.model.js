const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    businessName: { type: String, required: true },
    taxId: { type: String }, // Private
    callButtonEnabled: { type: Boolean, default: true },
    businessEmail: String,
    businessPhone: String,
    publicDescription: { type: String },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    location: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    revenue: { type: Number, default: 0 }, // Private
    totalBookings: { type: Number, default: 0 }, // Private
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    documents: [{
        type: {
            type: String,
            enum: ['AADHAAR_FRONT', 'AADHAAR_BACK', 'DL', 'RC', 'INSURANCE', 'PROFILE_PHOTO', 'BUSINESS_REG'],
            required: true
        },
        url: {
            type: String,
            required: true
        },
        verified: {
            type: Boolean,
            default: false
        }
    }],
    aadhaarNumber: { type: String }, // Masked in frontend
    rejectionReason: String,
    verifiedAt: Date,
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vendor', vendorSchema);
