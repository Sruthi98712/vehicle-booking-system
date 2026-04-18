const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.put('/change-password', protect, userController.changePassword);
router.delete('/delete-account', protect, userController.deleteAccount);
router.post('/toggle-save/:vehicleId', protect, userController.toggleSaveVehicle);

module.exports = router;
