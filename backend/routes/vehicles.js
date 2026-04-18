const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const vehicleController = require('../controllers/vehicle.controller');

const { protect, authorizeRoles } = require('../middleware/auth.middleware');
const { validate, vehicleSchemas } = require('../middleware/validate.middleware');
const { ensureVendorApproved } = require('../middleware/vendorApproval.middleware');

// Public routes
router.get('/nearby', vehicleController.getNearbyVehicles);
router.get('/search', vehicleController.searchVehicles);
router.get('/', async (req, res) => {
  try {
    const filter = { vendorId: { $exists: true, $ne: null } };
    if (req.query.available !== undefined) {
      filter.available = req.query.available === 'true';
    }
    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: vehicles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    const v = await Vehicle.findById(req.params.id);
    if (!v) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, data: v });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/vendor-info/:id', vehicleController.getVendorDetails);

router.get('/type/:type', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ 
      type: new RegExp(`^${req.params.type}$`, 'i'),
      vendorId: { $exists: true, $ne: null }
    }).populate('vendorId', 'name city averageRating').sort({ createdAt: -1 });
    
    const formatted = vehicles.map(v => ({
      vehicleId: v._id,
      vehicleName: `${v.make} ${v.model}`,
      images: v.images || [],
      pricePerDay: v.rentalPricePerDay,
      vendor: {
        name: v.vendorId?.name || 'Unknown Vendor',
        rating: v.vendorId?.averageRating || 0,
        location: v.vendorId?.city || v.city || 'Local'
      }
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Protected routes
router.use(protect);

router.post('/estimate', vehicleController.estimateVehiclePrice);

// Vendor/Admin only
router.get('/my/all', authorizeRoles('vendor'), ensureVendorApproved, vehicleController.getMyVehicles);
router.post('/', authorizeRoles('vendor', 'admin'), ensureVendorApproved, validate(vehicleSchemas.create), vehicleController.createVehicle);
router.put('/:id', authorizeRoles('vendor', 'admin'), ensureVendorApproved, vehicleController.updateVehicle);

router.delete('/:id', authorizeRoles('vendor', 'admin'), async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') filter.vendorId = req.user._id;

    const v = await Vehicle.findOne(filter);
    if (!v) return res.status(404).json({ success: false, message: 'Vehicle not found or not authorized' });

    // Enforce approval for deletion as well (optional but recommended)
    if (req.user.role === 'vendor') {
      const Vendor = require('../models/vendor.model');
      const vendor = await Vendor.findOne({ userId: req.user._id });
      if (vendor.status !== 'APPROVED') {
        return res.status(403).json({ success: false, message: 'Account must be approved to delete vehicles' });
      }
    }

    const removed = await Vehicle.findOneAndDelete(filter);
    if (!removed) return res.status(404).json({ success: false, message: 'Vehicle not found or not authorized' });
    res.json({ success: true, message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
