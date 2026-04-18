const express = require('express');
const router = express.Router();
const Booking = require('../models/booking.model');
const { protect } = require('../middleware/auth.middleware');

router.post('/simulate', protect, async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { paymentStatus: 'paid', status: 'completed' },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json({ message: 'Payment simulated successfully', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
