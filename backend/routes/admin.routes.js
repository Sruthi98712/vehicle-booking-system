const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/vendors/pending', adminController.getPendingVendors);
router.post('/vendors/verify', adminController.verifyVendorRequest);

module.exports = router;
