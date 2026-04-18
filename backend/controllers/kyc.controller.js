const Vendor = require('../models/vendor.model');
const { maskAadhaar } = require('../utils/kyc.utils');

const submitKYC = async (req, res) => {
    const { aadhaarNumber, documents } = req.body;
    try {
        let vendor = await Vendor.findOne({ userId: req.user.id });

        if (!vendor) {
            vendor = new Vendor({
                userId: req.user.id,
                businessName: req.user.name + ' Business' // Placeholder
            });
        }

        // Standardize documents array
        vendor.documents = documents.map(doc => ({
            type: doc.type,
            url: doc.url,
            verified: false
        }));

        vendor.aadhaarNumber = maskAadhaar(aadhaarNumber);
        vendor.status = 'PENDING';

        await vendor.save();

        res.json({
            success: true,
            message: 'KYC documents submitted successfully. Pending admin review.',
            data: vendor
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getKYCStatus = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ userId: req.user.id });
        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor profile not found' });
        }
        res.json({
            success: true,
            data: {
                status: vendor.status,
                rejectionReason: vendor.rejectionReason,
                verifiedAt: vendor.verifiedAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    submitKYC,
    getKYCStatus
};
