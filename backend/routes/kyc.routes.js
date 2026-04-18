const express = require('express');
const router = express.Router();
const { submitKYC, getKYCStatus } = require('../controllers/kyc.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/submit', protect, submitKYC);
router.get('/status', protect, getKYCStatus);

module.exports = router;
