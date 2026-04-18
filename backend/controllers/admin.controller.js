const Vendor = require('../models/vendor.model');
const verificationService = require('../services/vendorVerification.service');

const getPendingVendors = async (req, res) => {
    try {
        const pending = await Vendor.find({ status: 'PENDING' })
            .populate('userId', 'name email phone');
        res.status(200).json({ success: true, data: pending });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const verifyVendorRequest = async (req, res) => {
    try {
        const { vendorId, status, rejectionReason } = req.body;
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const vendor = await verificationService.updateVerificationStatus(
            vendorId,
            req.user._id,
            status,
            rejectionReason
        );

        res.status(200).json({ success: true, data: vendor });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { getPendingVendors, verifyVendorRequest };
