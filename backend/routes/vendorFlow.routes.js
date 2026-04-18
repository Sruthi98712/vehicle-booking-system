const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    addVehicle, 
    getVendorVehicles, 
    getVehicleCustomers, 
    updateBookingStatus 
} = require('../controllers/vendorFlow.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorizeRoles('vendor'));

router.get('/stats', getDashboardStats);
router.get('/vehicles', getVendorVehicles);
router.post('/vehicles/add', addVehicle);
router.get('/vehicle/:vehicleId/customers', getVehicleCustomers);
router.patch('/bookings/:id', updateBookingStatus);

module.exports = router;
