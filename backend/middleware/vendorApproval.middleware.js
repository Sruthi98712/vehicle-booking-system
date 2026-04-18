const Vendor = require('../models/vendor.model');

const ensureVendorApproved = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ userId: req.user._id });

        if (!vendor) {
            return res.status(403).json({
                success: false,
                message: 'Vendor profile not found. Please complete onboarding.'
            });
        }

        if (vendor.status !== 'APPROVED') {
            return res.status(403).json({
                success: false,
                message: `Your account status is ${vendor.status}. Please wait for admin approval.`
            });
        }

        req.vendor = vendor; // Attach vendor object for convenience
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { ensureVendorApproved };
