const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getAllBookings,
    updateBookingStatus,
    getBookingDetails,
    bulkDeleteBookings
} = require('../controllers/booking.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');

const extensionController = require('../controllers/extension.controller');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id/details', protect, getBookingDetails);
router.get('/all', protect, authorizeRoles('admin', 'vendor'), getAllBookings);
router.patch('/:id/status', protect, authorizeRoles('admin', 'vendor'), updateBookingStatus);
router.post('/bulk-delete', protect, bulkDeleteBookings);

// Extension Routes
router.post('/extensions/request', protect, extensionController.requestExtension);
router.get('/extensions/vendor-requests', protect, authorizeRoles('vendor'), extensionController.getExtensionRequests);
router.put('/extensions/approve/:extensionId', protect, authorizeRoles('vendor'), extensionController.approveExtension);

module.exports = router;
