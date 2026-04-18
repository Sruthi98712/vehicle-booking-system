const Vendor = require('../models/vendor.model');
const AuditLog = require('../models/auditLog.model');
const { notifyOnboardingDecision } = require('./whatsapp.service');
const { sendEmail } = require('./email.service');

const updateVerificationStatus = async (vendorId, adminId, status, rejectionReason = '') => {
    const vendor = await Vendor.findById(vendorId).populate('userId');
    if (!vendor) throw new Error('Vendor not found');

    vendor.status = status;
    vendor.verifiedBy = adminId;
    vendor.verifiedAt = status === 'APPROVED' ? new Date() : undefined;

    if (status === 'REJECTED') {
        vendor.rejectionReason = rejectionReason;
    }

    await vendor.save();

    // Create Audit Log
    try {
        await AuditLog.create({
            adminId,
            action: status === 'APPROVED' ? 'VENDOR_APPROVE' : 'VENDOR_REJECT',
            targetId: vendor._id,
            targetType: 'Vendor',
            details: status === 'REJECTED' ? `Reason: ${rejectionReason}` : 'Vendor approved successfully'
        });
    } catch (auditError) {
        console.error('Failed to create audit log:', auditError);
        // We don't throw here to avoid failing the main verification process
    }

    // Notify Vendor
    const decisionText = status === 'APPROVED' ? 'approved' : 'rejected';
    const reasonText = rejectionReason ? ` Reason: ${rejectionReason}` : '';

    // WhatsApp
    try {
        await notifyOnboardingDecision(vendor.userId.phone, status, rejectionReason);
    } catch (waError) {
        console.error('WhatsApp notification failed:', waError);
    }

    // Email
    try {
        await sendEmail(
            vendor.userId.email,
            `Vendor Onboarding ${status}`,
            `Your vendor account has been ${decisionText}.${reasonText}`
        );
    } catch (emailError) {
        console.error('Email notification failed:', emailError);
    }

    return vendor;
};

const uploadVendorDocuments = async (vendorId, docs) => {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) throw new Error('Vendor not found');

    // In production, docs would be Cloudinary results
    vendor.documents = docs.map(doc => ({
        type: doc.type,
        url: doc.url,
        verified: false
    }));

    vendor.status = 'PENDING';
    return await vendor.save();
};

module.exports = { updateVerificationStatus, uploadVendorDocuments };
