const Booking = require('../models/booking.model');
const Vehicle = require('../models/Vehicle');
const User = require('../models/user.model');

const { getAdminAnalytics } = require('../services/analytics.service');
const { getVendorStats } = require('../services/vendor.service');

const getAdminDashboard = async (req, res) => {
    try {
        const analytics = await getAdminAnalytics();
        res.status(200).json({ success: true, data: analytics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getVendorDashboard = async (req, res) => {
    try {
        const stats = await getVendorStats(req.user._id);
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAdminAnalytics: getAdminDashboard,
    getVendorAnalytics: getVendorDashboard
};
