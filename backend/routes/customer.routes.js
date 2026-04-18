const express = require('express');
const router = express.Router();
const { getVehiclesByType, createBooking } = require('../controllers/customer.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.get('/vehicles/type/:vehicleType', getVehiclesByType);

// Protected routes
router.post('/bookings/create', protect, createBooking);

module.exports = router;
