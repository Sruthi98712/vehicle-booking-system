const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/admin', protect, authorizeRoles('admin'), analyticsController.getAdminAnalytics);
router.get('/vendor', protect, authorizeRoles('vendor', 'admin'), analyticsController.getVendorAnalytics);

module.exports = router;
