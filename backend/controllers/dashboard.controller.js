const mongoose = require('mongoose');
const Booking = require('../models/booking.model');
const Vehicle = require('../models/Vehicle');
const User = require('../models/user.model');

const getAdminDashboard = async (req, res) => {
    try {
        const totalVehicles = await Vehicle.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const totalUsers = await User.countDocuments();

        const revenueData = await Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);

        const recentBookings = await Booking.find()
            .populate('userId', 'name email')
            .populate('vehicleId', 'make model')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                totalVehicles,
                totalBookings,
                totalUsers,
                totalRevenue: revenueData[0]?.totalRevenue || 0,
                recentBookings
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getVendorDashboard = async (req, res) => {
    try {
        const vendorId = req.user._id;

        // Total Vehicles for this vendor
        const totalVehicles = await Vehicle.countDocuments({ vendorId });

        // Total Bookings for this vendor's vehicles
        const vendorVehicleIds = await Vehicle.find({ vendorId }).select('_id');
        const vehicleIdsArray = vendorVehicleIds.map(v => v._id);

        const totalBookings = await Booking.countDocuments({ vehicleId: { $in: vehicleIdsArray } });

        // Total Revenue for this vendor
        const revenueData = await Booking.aggregate([
            { $match: { vehicleId: { $in: vehicleIdsArray }, paymentStatus: 'paid' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);

        // Recent Bookings
        const recentBookings = await Booking.find({ vehicleId: { $in: vehicleIdsArray } })
            .populate('userId', 'name email phone mobile city state country')
            .populate('vehicleId', 'make model type')
            .sort({ createdAt: -1 })
            .limit(10);

        // Vehicles by Type Breakdown
        const typeBreakdown = await Vehicle.aggregate([
            { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        // Customers per vehicle (Top performing vehicles)
        const vehiclePerformance = await Booking.aggregate([
            { $match: { vehicleId: { $in: vehicleIdsArray } } },
            { $group: { _id: '$vehicleId', customerCount: { $sum: 1 } } },
            { $sort: { customerCount: -1 } },
            { $lookup: { from: 'vehicles', localField: '_id', foreignField: '_id', as: 'vehicleInfo' } },
            { $unwind: '$vehicleInfo' },
            { $project: { make: '$vehicleInfo.make', model: '$vehicleInfo.model', type: '$vehicleInfo.type', customerCount: 1 } }
        ]);

        res.json({
            success: true,
            data: {
                summary: {
                    vehicles: totalVehicles,
                    bookings: totalBookings,
                    revenue: revenueData[0]?.totalRevenue || 0,
                    customers: await User.countDocuments({ _id: { $in: await Booking.distinct('userId', { vehicleId: { $in: vehicleIdsArray } }) } })
                },
                recentBookings,
                charts: {
                    typeBreakdown,
                    vehiclePerformance
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCustomerDashboard = async (req, res) => {
    try {
        const userId = req.user._id;
        const totalBookings = await Booking.countDocuments({ userId });

        const spendingData = await Booking.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), paymentStatus: 'paid' } },
            { $group: { _id: null, totalSpent: { $sum: '$totalAmount' } } }
        ]);

        const recentBookings = await Booking.find({ userId })
            .populate('vehicleId', 'make model vendorId')
            .sort({ createdAt: -1 })
            .limit(5);

        const user = await User.findById(userId).populate('savedVehicles', 'make model rentalPricePerDay type');

        res.json({
            success: true,
            data: {
                totalBookings,
                totalSpent: spendingData[0]?.totalSpent || 0,
                recentBookings,
                savedVehicles: user?.savedVehicles || []
            }
        });
    } catch (error) {
        console.error('CUSTOMER DASHBOARD ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCustomerDetailsForVendor = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'name phone city totalRatings averageRating')
            .populate('vehicleId', 'ownerId')
            .lean();

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify vendor ownership
        if (booking.vehicleId.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this customer' });
        }

        const totalBookings = await Booking.countDocuments({ userId: booking.userId._id });

        res.status(200).json({
            success: true,
            data: {
                name: booking.userId.name,
                city: booking.userId.city,
                rating: booking.userId.averageRating,
                phone: booking.userId.phone,
                totalRatings: booking.userId.totalRatings,
                totalBookings
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAdminDashboard,
    getVendorDashboard,
    getCustomerDashboard,
    getCustomerDetailsForVendor
};
