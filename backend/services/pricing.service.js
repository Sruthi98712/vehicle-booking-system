const Vehicle = require('../models/Vehicle');
const Booking = require('../models/booking.model');

const calculatePrice = async (vehicleId, startDate, endDate) => {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');

    let basePrice = vehicle.rentalPricePerDay;
    let factor = 1.0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;

    // 1. Weekend Multiplier
    const isWeekend = start.getDay() === 0 || start.getDay() === 6 || end.getDay() === 0 || end.getDay() === 6;
    if (isWeekend) {
        factor += 0.2; // 20% increase
    }

    // 2. Demand-based pricing (check bookings for this vehicle type in same city)
    const activeBookings = await Booking.countDocuments({
        vehicleId: { $in: await Vehicle.find({ type: vehicle.type, city: vehicle.city }).distinct('_id') },
        status: { $in: ['confirmed', 'pending'] },
        $or: [
            { startDate: { $lte: end, $gte: start } },
            { endDate: { $lte: end, $gte: start } }
        ]
    });

    if (activeBookings > 5) {
        factor += 0.3; // 30% increase for high demand
    }

    // 3. Peak Hour/Day logic
    const currentHour = new Date().getHours();
    if (currentHour >= 8 && currentHour <= 10) {
        factor += 0.1; // 10% morning rush
    }

    const finalPrice = basePrice * days * factor;

    return {
        totalAmount: Math.round(finalPrice),
        factor,
        breakdown: {
            basePrice,
            days,
            isWeekend,
            demandFactor: activeBookings > 5 ? 0.3 : 0
        }
    };
};

module.exports = { calculatePrice };
