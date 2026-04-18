const mongoose = require('mongoose');
const Vendor = require('../models/vendor.model');
const User = require('../models/user.model');
const Booking = require('../models/booking.model');
const Vehicle = require('../models/Vehicle');

const getVendorStats = async (vendorId) => {
    try {
        const vehicles = await Vehicle.find({ vendorId });
        const vehicleIds = vehicles.map(v => v._id);

        const totalBookings = await Booking.countDocuments({
            vehicleId: { $in: vehicleIds }
        });

        const revenueData = await Booking.aggregate([
            {
                $match: {
                    vehicleId: { $in: vehicleIds },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$vendorRevenue' },
                    totalCommission: { $sum: '$commissionAmount' }
                }
            }
        ]);

        const recentBookings = await Booking.find({
            vehicleId: { $in: vehicleIds }
        })
            .populate('userId', 'name email')
            .populate('vehicleId', 'make model')
            .sort({ createdAt: -1 })
            .limit(5);

        const monthlyRevenue = await Booking.aggregate([
            {
                $match: {
                    vehicleId: { $in: vehicleIds },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    revenue: { $sum: '$vendorRevenue' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        const chartData = monthlyRevenue.map(item => ({
            name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][item._id - 1],
            revenue: item.revenue
        }));

        const typeBreakdown = await Vehicle.aggregate([
            { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        const vehiclePerformance = await Booking.aggregate([
            {
                $match: {
                    vehicleId: { $in: vehicleIds }
                }
            },
            {
                $group: {
                    _id: '$vehicleId',
                    customerCount: { $sum: 1 }
                }
            },
            { $sort: { customerCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'vehicles',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'vehicleInfo'
                }
            },
            { $unwind: '$vehicleInfo' },
            {
                $project: {
                    _id: 1,
                    customerCount: 1,
                    make: '$vehicleInfo.make',
                    model: '$vehicleInfo.model',
                    type: '$vehicleInfo.type'
                }
            }
        ]);

        return {
            summary: {
                vehicles: vehicles.length,
                bookings: totalBookings,
                revenue: revenueData[0]?.totalRevenue || 0,
                commission: revenueData[0]?.totalCommission || 0
            },
            charts: {
                monthlyRevenue: chartData,
                typeBreakdown,
                vehiclePerformance
            },
            recentBookings
        };
    } catch (error) {
        throw error;
    }
};

const registerVendorProfile = async (userId, businessData) => {
    const vendor = await Vendor.create({
        userId,
        ...businessData
    });
    return vendor;
};

module.exports = { getVendorStats, registerVendorProfile };
