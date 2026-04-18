const express = require('express');
const router = express.Router();
const { getNearbyVehicles } = require('../controllers/discovery.controller');

router.get('/nearby', getNearbyVehicles);

module.exports = router;
