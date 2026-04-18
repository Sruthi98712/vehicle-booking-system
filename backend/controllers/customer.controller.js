const Vehicle = require('../models/Vehicle');
const Booking = require('../models/booking.model');
const Vendor = require('../models/vendor.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

// @desc    Get vehicles by type with filters
// @route   GET /api/vehicles/type/:vehicleType
// @access  Public
exports.getVehiclesByType = async (req, res) => {
    try {
        const { vehicleType } = req.params;
        const { location, priceMin, priceMax, rating } = req.query;

        let query = { type: vehicleType, available: true };

        if (location) {
            query.city = { $regex: location, $options: 'i' };
        }

        if (priceMin || priceMax) {
            query.rentalPricePerDay = {};
            if (priceMin) query.rentalPricePerDay.$gte = Number(priceMin);
            if (priceMax) query.rentalPricePerDay.$lte = Number(priceMax);
        }

        if (rating) {
            query.averageRating = { $gte: Number(rating) };
        }

        const vehicles = await Vehicle.find(query).populate({
            path: 'vendorId',
            select: 'name phone email role' // vendorId in Vehicle model refs 'User'
        });

        // We also need vendor specific info from Vendor model if available
        const enhancedVehicles = await Promise.all(vehicles.map(async (v) => {
            const vendorProfile = await Vendor.findOne({ userId: v.vendorId._id });
            return {
                vehicleId: v._id,
                vehicleName: `${v.make} ${v.model}`,
                vehicleType: v.type,
                pricePerDay: v.rentalPricePerDay,
                images: v.images || [], // Assuming images might be added
                vendor: {
                    vendorId: v.vendorId._id,
                    name: vendorProfile ? vendorProfile.businessName : v.vendorId.name,
                    phone: vendorProfile ? vendorProfile.businessPhone : v.vendorId.phone,
                    rating: v.averageRating, // Using vehicle rating as placeholder if vendor rating not explicitly asked per vehicle
                    location: vendorProfile ? vendorProfile.address.city : v.city
                }
            };
        }));

        res.status(200).json({
            success: true,
            count: enhancedVehicles.length,
            data: enhancedVehicles
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a new booking
// @route   POST /api/bookings/create
// @access  Private (Customer)
exports.createBooking = async (req, res) => {
    try {
        const { vehicleId, vendorId, startDate, endDate, pickupLocation } = req.body;

        if (!vehicleId || !vendorId || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        // Calculate total amount
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        const totalAmount = diffDays * vehicle.rentalPricePerDay;

        const booking = await Booking.create({
            userId: req.user._id, // Set by protect middleware
            vehicleId,
            vendorId,
            startDate,
            endDate,
            totalAmount,
            status: 'pending',
            pickupLocation // Optional field if added to schema, else just storage
        });

        res.status(201).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
