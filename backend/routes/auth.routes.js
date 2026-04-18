const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, refreshAccessToken, googleLogin, sendOTP, verifyOTP } = require('../controllers/auth.controller');
const { validate, authSchemas } = require('../middleware/validate.middleware');

router.post('/register', validate(authSchemas.register), registerUser);
router.post('/login', validate(authSchemas.login), loginUser);
router.post('/google-login', googleLogin);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/logout', logoutUser);
router.post('/refresh-token', refreshAccessToken);

module.exports = router;
