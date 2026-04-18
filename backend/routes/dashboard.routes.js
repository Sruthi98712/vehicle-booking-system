const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const analyticsController = require('../controllers/analytics.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/admin', protect, authorizeRoles('admin'), analyticsController.getAdminAnalytics);
router.get('/vendor', protect, authorizeRoles('vendor'), analyticsController.getVendorAnalytics);
router.get('/customer', protect, authorizeRoles('customer'), dashboardController.getCustomerDashboard);
router.get('/vendor/customer-details/:id', protect, authorizeRoles('vendor'), dashboardController.getCustomerDetailsForVendor);

module.exports = router;
