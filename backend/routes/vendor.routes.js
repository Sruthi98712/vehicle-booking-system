const express = require('express');
const router = express.Router();
const { getMyStats, setupVendorProfile, getPublicVendorProfile, sendManualReminder } = require('../controllers/vendor.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/profile/:id', getPublicVendorProfile); // Publicly accessible

router.use(protect);
router.use(authorizeRoles('vendor', 'admin'));

router.get('/dashboard/stats', getMyStats);
router.post('/profile', setupVendorProfile);
router.post('/reminder', sendManualReminder);

module.exports = router;
