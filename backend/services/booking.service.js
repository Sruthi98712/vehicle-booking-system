const { calculatePrice } = require('./pricing.service');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/booking.model');

const checkAvailability = async (vehicleId, startDate, endDate) => {
    const overlappingBooking = await Booking.findOne({
        vehicleId,
        status: { $ne: 'cancelled' },
        $or: [
            { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
        ]
    });
    return !overlappingBooking;
};

const createBooking = async (bookingData) => {
    const { vehicleId, startDate, endDate } = bookingData;
    const isAvailable = await checkAvailability(vehicleId, startDate, endDate);

    if (!isAvailable) {
        throw new Error('Vehicle is already booked for the selected dates');
    }

    const priceDetails = await calculatePrice(vehicleId, startDate, endDate);
    const vehicle = await Vehicle.findById(vehicleId);

    const commissionRate = vehicle.commissionRate || 10;
    const commissionAmount = (priceDetails.totalAmount * commissionRate) / 100;
    const vendorRevenue = priceDetails.totalAmount - commissionAmount;

    const booking = new Booking({
        ...bookingData,
        vendorId: vehicle.vendorId, // Associate vendor
        totalAmount: priceDetails.totalAmount,
        commissionAmount,
        vendorRevenue,
        dynamicPricingApplied: priceDetails.factor > 1.0,
        pricingFactor: priceDetails.factor
    });

    return await booking.save();
};

module.exports = {
    checkAvailability,
    createBooking
};
