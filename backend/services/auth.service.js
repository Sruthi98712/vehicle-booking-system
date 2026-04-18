const crypto = require('crypto');

/**
 * Mocks sending an OTP via SMS.
 * In a real-world scenario, this would use Twilio or a similar service.
 */
const sendOTP = async (mobile, code) => {
    console.log(`[SMS MOCK] Sending OTP ${code} to ${mobile}`);
    // Simulate API delay
    return new Promise((resolve) => setTimeout(resolve, 500));
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

module.exports = {
    sendOTP,
    generateOTP
};
