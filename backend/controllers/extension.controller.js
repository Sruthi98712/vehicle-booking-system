const extensionService = require('../services/extension.service');

const requestExtension = async (req, res) => {
    try {
        const { bookingId, newEndDate, reason } = req.body;
        const extension = await extensionService.requestExtension(bookingId, req.user._id, newEndDate, reason);
        res.status(201).json({ success: true, data: extension });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const approveExtension = async (req, res) => {
    try {
        const { extensionId } = req.params;
        const result = await extensionService.approveExtension(extensionId, req.user._id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getExtensionRequests = async (req, res) => {
    try {
        // Vendors see requests for their vehicles
        const Booking = require('../models/booking.model');
        const Vehicle = require('../models/Vehicle');
        const ExtensionRequest = require('../models/extension.model');

        const myVehicles = await Vehicle.find({ vendorId: req.user._id }).select('_id');
        const myBookings = await Booking.find({ vehicleId: { $in: myVehicles } }).select('_id');

        const requests = await ExtensionRequest.find({ bookingId: { $in: myBookings } })
            .populate('bookingId')
            .populate('requestedBy', 'name email');

        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { requestExtension, approveExtension, getExtensionRequests };
