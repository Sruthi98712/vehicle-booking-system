const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '15m'
    });
};

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret', {
        expiresIn: '7d'
    });
};

const registerUser = async (req, res) => {
    const { name, email, password, role, mobile, city, state } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        const user = await User.create({ name, email, password, role, mobile, city, state });

        const accessToken = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: accessToken
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            const accessToken = generateToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            user.refreshToken = refreshToken;
            await user.save();

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: accessToken
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const logoutUser = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        const user = await User.findOne({ refreshToken });
        if (user) {
            user.refreshToken = null;
            await user.save();
        }
    }
    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const refreshAccessToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret');
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        const accessToken = generateToken(user._id);
        res.status(200).json({ success: true, token: accessToken });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
};

const googleLogin = async (req, res) => {
    const { googleId, email, name } = req.body;
    try {
        let user = await User.findOne({ googleId });
        if (!user) {
            // Check if user exists with this email but no googleId
            user = await User.findOne({ email });
            if (user) {
                user.googleId = googleId;
                await user.save();
            } else {
                // Create new user (Role: Customer)
                user = await User.create({
                    name,
                    email,
                    googleId,
                    role: 'customer',
                    password: crypto.randomBytes(16).toString('hex') // Random pass for internal consistency
                });
            }
        }

        const accessToken = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: accessToken
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const sendOTP = async (req, res) => {
    const { mobile } = req.body;
    try {
        const otpCode = authService.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        let user = await User.findOne({ mobile });
        if (!user) {
            // Create a temp user or just wait for verification
            user = await User.create({
                name: 'User ' + mobile.slice(-4),
                mobile,
                role: 'customer',
                password: crypto.randomBytes(16).toString('hex'),
                email: `${mobile}@vms.temp` // Temporary unique email
            });
        }

        user.otp = { code: otpCode, expiresAt };
        await user.save();

        await authService.sendOTP(mobile, otpCode);

        res.json({ success: true, message: 'OTP sent to mobile number' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const verifyOTP = async (req, res) => {
    const { mobile, code } = req.body;
    try {
        const user = await User.findOne({ mobile });
        if (!user || !user.otp || user.otp.code !== code || user.otp.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        user.isMobileVerified = true;
        user.otp = undefined;

        const accessToken = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                role: user.role,
                token: accessToken
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { registerUser, loginUser, logoutUser, refreshAccessToken, googleLogin, sendOTP, verifyOTP };
