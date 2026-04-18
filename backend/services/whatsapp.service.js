/**
 * WhatsApp Service (MOCK with real structure)
 * In production, replace the console.logs with real Twilio / Meta Cloud API calls.
 */
const sendWhatsAppMessage = async (to, body) => {
    try {
        console.log(`[WhatsApp API] Sending to ${to}: ${body}`);
        // Integration Logic Example:
        // const client = require('twilio')(sid, auth);
        // await client.messages.create({ from: 'whatsapp:+14155238886', body, to: `whatsapp:${to}` });
        return true;
    } catch (error) {
        console.error('[WhatsApp API Error]', error);
        return false;
    }
};

const notifyBookingConfirmed = (phone, bookingId, vehicle) => {
    const msg = `Hello! Your booking for ${vehicle} (ID: ${bookingId}) is CONFIRMED. View details in the app.`;
    return sendWhatsAppMessage(phone, msg);
};

const notifyPaymentSuccess = (phone, amount) => {
    const msg = `Payment of ₹${amount} was successful. Thank you for choosing our Smart Mobility platform!`;
    return sendWhatsAppMessage(phone, msg);
};

const notifyExtensionDecision = (phone, status, newDate) => {
    const msg = `Your extension request has been ${status.toUpperCase()}. New end date: ${newDate.toDateString()}.`;
    return sendWhatsAppMessage(phone, msg);
};

const notifyOnboardingDecision = (phone, status, rejectionReason = '') => {
    const decisionText = status === 'APPROVED' ? 'APPROVED! You can now start listing your vehicles.' : `REJECTED. Reason: ${rejectionReason}`;
    const msg = `Hello from Smart Mobility! Your vendor application has been ${decisionText}`;
    return sendWhatsAppMessage(phone, msg);
};

module.exports = {
    sendWhatsAppMessage,
    notifyBookingConfirmed,
    notifyPaymentSuccess,
    notifyExtensionDecision,
    notifyOnboardingDecision
};
