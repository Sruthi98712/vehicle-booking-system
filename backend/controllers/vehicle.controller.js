const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
require('../models/booking.model'); // Ensure Booking model is registered

// Advanced Search with Filters, Sorting, and Pagination
const { calculatePrice } = require('../services/pricing.service');

// Advanced Search with Filters, Sorting, and Pagination
const searchVehicles = async (req, res) => {
    try {
        const {
            search,
            city,
            type,
            minPrice,
            maxPrice,
            fuelType,
            transmission,
            rating,
            available,
            sortBy,
            page = 1,
            limit = 10
        } = req.query;

        // Only show vehicles with vendors
        const query = { vendorId: { $exists: true, $ne: null } };

        if (search) {
            query.$and = [
                { vendorId: { $exists: true, $ne: null } },
                {
                    $or: [
                        { make: { $regex: search, $options: 'i' } },
                        { model: { $regex: search, $options: 'i' } },
                        { city: { $regex: search, $options: 'i' } }
                    ]
                }
            ];
        } else if (city) {
            query.city = { $regex: city, $options: 'i' };
        }

        if (type) query.type = type;
        if (fuelType) query.fuelType = fuelType;
        if (transmission) query.transmission = transmission;
        if (rating) query.rating = { $gte: Number(rating) };
        if (available !== undefined) query.available = available === 'true';

        if (minPrice || maxPrice) {
            query.rentalPricePerDay = {};
            if (minPrice) query.rentalPricePerDay.$gte = Number(minPrice);
            if (maxPrice) query.rentalPricePerDay.$lte = Number(maxPrice);
        }

        let sort = {};
        switch (sortBy) {
            case 'price_asc': sort.rentalPricePerDay = 1; break;
            case 'price_desc': sort.rentalPricePerDay = -1; break;
            case 'newest': sort.createdAt = -1; break;
            case 'rating': sort.rating = -1; break;
            default: sort.createdAt = -1;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const vehicles = await Vehicle.find(query)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        const total = await Vehicle.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                vehicles,
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getVendorDetails = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        const vehicle = await Vehicle.findById(req.params.id).populate('vendorId', 'name city state country averageRating totalRatings');
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        if (!vehicle.vendorId) {
            return res.status(404).json({ success: false, message: 'Vendor information missing for this vehicle' });
        }

        const vendorId = vehicle.vendorId._id;
        const totalVehicles = await Vehicle.countDocuments({ vendorId });

        const vendorVehicles = await Vehicle.find({ vendorId }).select('_id');
        const vehicleIds = vendorVehicles.map(v => v._id);
        const totalTrips = await mongoose.model('Booking').countDocuments({
            vehicleId: { $in: vehicleIds },
            status: 'completed'
        });

        res.status(200).json({
            success: true,
            data: {
                name: vehicle.vendorId.name,
                email: vehicle.vendorId.email,
                phone: vehicle.vendorId.phone,
                location: `${vehicle.vendorId.city || ''}, ${vehicle.vendorId.state || ''}`,
                averageRating: vehicle.vendorId.averageRating,
                totalRatings: vehicle.vendorId.totalRatings,
                totalVehicles,
                totalTrips
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const estimateVehiclePrice = async (req, res) => {
    try {
        const { vehicleId, startDate, endDate } = req.body;
        const priceDetails = await calculatePrice(vehicleId, startDate, endDate);
        res.status(200).json({ success: true, data: priceDetails });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getMyVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ vendorId: req.user._id });
        res.status(200).json({ success: true, data: vehicles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createVehicle = async (req, res) => {
    try {
        const vehicle = new Vehicle({
            ...req.body,
            vendorId: req.user._id
        });
        const saved = await vehicle.save();
        res.status(201).json({ success: true, data: saved });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({ _id: req.params.id, vendorId: req.user._id });
        if (!vehicle && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this vehicle' });
        }

        const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getNearbyVehicles = async (req, res) => {
    try {
        const { latitude, longitude, radius = 5, limit = 20 } = req.query; // radius in km

        if (!latitude || !longitude) {
            return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
        }

        // 6371 is the radius of Earth in km
        const radiusInRadians = Number(radius) / 6371;

        const vehicles = await Vehicle.find({
            location: {
                $geoWithin: {
                    $centerSphere: [[Number(longitude), Number(latitude)], radiusInRadians]
                }
            },
            available: true,
            vendorId: { $exists: true, $ne: null }
        })
            .populate('vendorId', 'name city averageRating')
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            count: vehicles.length,
            data: vehicles
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    searchVehicles,
    getVendorDetails,
    estimateVehiclePrice,
    getMyVehicles,
    createVehicle,
    updateVehicle,
    getNearbyVehicles
};
