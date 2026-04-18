const Booking = require('../models/booking.model');
const Vehicle = require('../models/Vehicle');
const ExtensionRequest = require('../models/extension.model');
const { calculatePrice } = require('./pricing.service');

const requestExtension = async (bookingId, userId, newEndDate, reason) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error('Booking not found');
    if (booking.userId.toString() !== userId.toString()) {
        throw new Error('Unauthorized to extend this booking');
    }

    if (new Date(newEndDate) <= new Date(booking.endDate)) {
        throw new Error('New end date must be after current end date');
    }

    // Check if vehicle is available for the extra period
    const overlapping = await Booking.findOne({
        vehicleId: booking.vehicleId,
        _id: { $ne: bookingId },
        status: { $ne: 'cancelled' },
        $or: [
            { startDate: { $lte: newEndDate }, endDate: { $gte: booking.endDate } }
        ]
    });

    if (overlapping) {
        throw new Error('Vehicle is already booked for the extended period');
    }

    // Calculate additional price for the extra days
    const priceDetails = await calculatePrice(booking.vehicleId, booking.endDate, newEndDate);

    const extension = new ExtensionRequest({
        bookingId,
        requestedBy: userId,
        newEndDate,
        reason,
        additionalAmount: priceDetails.totalAmount
    });

    return await extension.save();
};

const { notifyExtensionDecision } = require('./whatsapp.service');
const User = require('../models/user.model');

const approveExtension = async (extensionId, vendorId) => {
    const extension = await ExtensionRequest.findById(extensionId).populate({
        path: 'bookingId',
        populate: { path: 'userId' }
    });
    if (!extension) throw new Error('Extension request not found');

    const vehicle = await Vehicle.findById(extension.bookingId.vehicleId);
    if (vehicle.vendorId.toString() !== vendorId.toString()) {
        throw new Error('Unauthorized to approve this extension');
    }

    if (extension.status !== 'pending') {
        throw new Error('Extension already processed');
    }

    // Update Booking
    const booking = extension.bookingId;
    booking.endDate = extension.newEndDate;
    booking.totalAmount += extension.additionalAmount;

    // Recalculate commission for the extra part
    const commissionRate = vehicle.commissionRate || 10;
    const extraCommission = (extension.additionalAmount * commissionRate) / 100;
    booking.commissionAmount += extraCommission;
    booking.vendorRevenue += (extension.additionalAmount - extraCommission);

    await booking.save();

    extension.status = 'approved';
    extension.decisionDate = new Date();
    await extension.save();

    // Trigger Notification
    if (booking.userId.preferences?.whatsappNotifications) {
        await notifyExtensionDecision(booking.userId.phone, 'approved', extension.newEndDate);
    }

    return { booking, extension };
};

module.exports = { requestExtension, approveExtension };
