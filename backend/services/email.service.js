const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    // Mock SMTP for testing (use environment variables in prod)
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: process.env.SMTP_USER || 'mock_user',
        pass: process.env.SMTP_PASS || 'mock_pass'
    }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        console.log(`[Email Service] Sending to ${to}: ${subject}`);
        // await transporter.sendMail({ from: '"VMS Support" <support@vms.com>', to, subject, text, html });
        return true;
    } catch (error) {
        console.error('[Email Service Error]', error);
        return false;
    }
};

const sendRegistrationEmail = (user) => {
    const html = `<h1>Welcome ${user.name}!</h1><p>Your account has been successfully created as a ${user.role}.</p>`;
    return sendEmail(user.email, 'Welcome to Smart Mobility Platform', 'Welcome!', html);
};

const sendInvoiceEmail = (user, booking, vehicle) => {
    const html = `<h3>Invoice for Booking #${booking._id}</h3>
                  <p>Vehicle: ${vehicle}</p>
                  <p>Total Amount: ₹${booking.totalAmount}</p>
                  <p>Download your receipt from the profile section.</p>`;
    return sendEmail(user.email, 'Booking Receipt & Invoice', 'Invoice Attached', html);
};

module.exports = {
    sendRegistrationEmail,
    sendInvoiceEmail,
    sendEmail
};
