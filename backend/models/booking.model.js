const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    commissionAmount: { type: Number, default: 0 },
    vendorRevenue: { type: Number, default: 0 },
    dynamicPricingApplied: { type: Boolean, default: false },
    pricingFactor: { type: Number, default: 1.0 },
    createdAt: { type: Date, default: Date.now },
    bookingMonth: { type: String },
    bookingYear: { type: Number },
    hiddenByCustomer: { type: Boolean, default: false }
});

bookingSchema.pre('save', function (next) {
    if (this.createdAt) {
        const date = new Date(this.createdAt);
        this.bookingMonth = date.toLocaleString('default', { month: 'short' });
        this.bookingYear = date.getFullYear();
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);
