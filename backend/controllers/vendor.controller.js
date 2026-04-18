const { getVendorStats, registerVendorProfile } = require('../services/vendor.service');
const User = require('../models/user.model');
const Vendor = require('../models/vendor.model');

const getMyStats = async (req, res) => {
    try {
        // Enforce isolation: ensure we use the logged-in user's data
        const stats = await getVendorStats(req.user._id);
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const setupVendorProfile = async (req, res) => {
    try {
        const vendor = await registerVendorProfile(req.user._id, req.body);
        res.status(201).json({ success: true, data: vendor });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getPublicVendorProfile = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ _id: req.params.id, status: 'APPROVED' })
            .select('businessName rating address publicDescription callButtonEnabled businessPhone -_id')
            .populate('userId', 'name profileImage');

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        res.status(200).json({ success: true, data: vendor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const { notifyWhatsAppReminder } = require('../services/whatsapp.service');

const sendManualReminder = async (req, res) => {
    try {
        const { bookingId, phone, message } = req.body;
        // Verify vendor owns this booking
        const Booking = require('../models/booking.model');
        const Vehicle = require('../models/Vehicle');

        const booking = await Booking.findById(bookingId);
        const vehicle = await Vehicle.findById(booking.vehicleId);

        if (vehicle.vendorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const { sendWhatsAppMessage } = require('../services/whatsapp.service');
        await sendWhatsAppMessage(phone, message || `Reminder: Please return the vehicle for booking ${bookingId}`);

        res.status(200).json({ success: true, message: 'Reminder sent via WhatsApp' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getMyStats, setupVendorProfile, getPublicVendorProfile, sendManualReminder };
