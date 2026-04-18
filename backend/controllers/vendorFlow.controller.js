const Vehicle = require('../models/Vehicle');
const Booking = require('../models/booking.model');
const mongoose = require('mongoose');

// @desc    Get vendor dashboard stats
// @route   GET /api/vendor/stats
// @access  Private (Vendor)
const getDashboardStats = async (req, res) => {
    try {
        const vendorId = req.user._id;

        // Total Vehicles
        const totalVehicles = await Vehicle.countDocuments({ vendorId });

        // Total Bookings
        const totalBookings = await Booking.countDocuments({ vendorId });

        // Total Customers (Unique users who booked)
        const bookings = await Booking.find({ vendorId }).select('userId');
        const uniqueCustomers = [...new Set(bookings.map(b => b.userId?.toString()))].filter(Boolean);
        const totalCustomers = uniqueCustomers.length;

        // Total Revenue (Only from completed bookings)
        const revenueData = await Booking.aggregate([
            { 
                $match: { 
                    vendorId: new mongoose.Types.ObjectId(vendorId),
                    status: 'completed'
                } 
            },
            { 
                $group: { 
                    _id: null, 
                    totalRevenue: { $sum: "$totalAmount" } 
                } 
            }
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // Vehicles by Type
        const vehiclesByType = await Vehicle.aggregate([
            { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);

        const typeStats = {};
        vehiclesByType.forEach(v => {
            typeStats[v._id] = v.count;
        });

        // Most booked vehicle
        const popularVehicle = await Booking.aggregate([
            { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
            { $group: { _id: "$vehicleId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        let mostBooked = null;
        if (popularVehicle.length > 0) {
            mostBooked = await Vehicle.findById(popularVehicle[0]._id).select('_id make model images rentalPricePerDay');
        }

        // Recent Bookings
        const recentBookings = await Booking.find({ vendorId })
            .populate('userId', 'name email phone mobile city state country')
            .populate('vehicleId', 'make model')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                totalVehicles,
                totalBookings,
                totalCustomers,
                totalRevenue,
                typeStats,
                recentBookings,
                mostBooked: mostBooked ? { 
                    ...mostBooked.toObject(), 
                    bookingCount: popularVehicle[0].count,
                    revenue: popularVehicle[0].count * mostBooked.rentalPricePerDay 
                } : null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add new vehicle
// @route   POST /api/vendor/vehicles/add
// @access  Private (Vendor)
const addVehicle = async (req, res) => {
    try {
        const {
            vehicleName,
            vehicleType,
            pricePerDay,
            images,
            description,
            availability,
            location
        } = req.body;

        const [make, ...modelParts] = vehicleName.split(' ');
        const model = modelParts.join(' ') || 'Standard';

        const vehicle = new Vehicle({
            vendorId: req.user._id,
            make,
            model,
            type: vehicleType,
            rentalPricePerDay: pricePerDay,
            images: images || [],
            description,
            available: availability === 'available',
            location: {
                type: 'Point',
                coordinates: [location.longitude, location.latitude]
            },
            city: req.user.city || 'Vijayawada' // Default or from user profile
        });

        await vehicle.save();
        res.status(201).json({ success: true, data: vehicle });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all vehicles for vendor
// @route   GET /api/vendor/vehicles
// @access  Private (Vendor)
const getVendorVehicles = async (req, res) => {
    try {
        const { type } = req.query;
        const query = { vendorId: req.user._id };
        if (type) query.type = type;

        const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: vehicles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get customers for a specific vehicle
// @route   GET /api/vendor/vehicle/:vehicleId/customers
// @access  Private (Vendor)
const getVehicleCustomers = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
            return res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
        }

        // Verify ownership
        const vehicle = await Vehicle.findOne({ _id: vehicleId, vendorId: req.user._id });
        if (!vehicle) {
            return res.status(403).json({ success: false, message: 'Not authorized or vehicle not found' });
        }

        const bookings = await Booking.find({ vehicleId })
            .populate('userId', 'name email phone mobile city state country')
            .sort({ createdAt: -1 });

        const customers = bookings.map(b => ({
            name: b.userId?.name,
            email: b.userId?.email,
            phone: b.userId?.phone,
            bookingDate: b.createdAt,
            status: b.status
        }));

        res.status(200).json({ success: true, data: customers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update booking status
// @route   PATCH /api/vendor/bookings/:id
// @access  Private (Vendor)
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findOne({ _id: req.params.id, vendorId: req.user._id });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        booking.status = status;
        await booking.save();

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    addVehicle,
    getVendorVehicles,
    getVehicleCustomers,
    updateBookingStatus
};
