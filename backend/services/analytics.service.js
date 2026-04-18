const Booking = require('../models/booking.model');
const Vehicle = require('../models/Vehicle');

const getAdminAnalytics = async () => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // 1. Overall Revenue and Commissions
    const revenueStats = await Booking.aggregate([
        { $match: { status: 'completed' } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' },
                adminCommission: { $sum: '$commissionAmount' },
                vendorRevenue: { $sum: '$vendorRevenue' }
            }
        }
    ]);

    // 2. Booking Status Counts
    const bookingCounts = await Booking.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // 3. Monthly Revenue Chart (last 6 months)
    const monthlyRevenue = await Booking.aggregate([
        {
            $match: {
                status: 'completed',
                createdAt: { $gte: new Date(today.getFullYear(), today.getMonth() - 5, 1) }
            }
        },
        {
            $group: {
                _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                revenue: { $sum: '$totalAmount' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // 4. Top 5 Performing Vehicles
    const topVehicles = await Booking.aggregate([
        { $match: { status: 'completed' } },
        {
            $group: {
                _id: '$vehicleId',
                revenue: { $sum: '$totalAmount' },
                trips: { $sum: 1 }
            }
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'vehicles',
                localField: '_id',
                foreignField: '_id',
                as: 'vehicle'
            }
        },
        { $unwind: '$vehicle' }
    ]);

    // 5. Vehicle Usage % (available vs booked)
    const totalUsers = await User.countDocuments();

    return {
        summary: {
            vehicles: totalVehicles,
            bookings: totalBookings,
            users: totalUsers,
            revenue: revenueStats[0]?.totalRevenue || 0,
            commission: revenueStats[0]?.adminCommission || 0
        },
        charts: {
            revenue: monthlyRevenue.map(m => ({
                name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m._id.month - 1],
                revenue: m.revenue
            })),
            bookings: bookingCounts.map(b => ({
                name: b._id || 'Unknown',
                count: b.count
            })),
            topVehicles: topVehicles.map(v => ({
                name: `${v.vehicle.make} ${v.vehicle.model}`,
                count: v.trips
            }))
        },
        usagePercentage: usagePercentage.toFixed(2),
        activeBookings: activeBookedVehicles.length
    };
};

module.exports = { getAdminAnalytics };
