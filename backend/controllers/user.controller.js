const userService = require('../services/user.service');

const getProfile = async (req, res) => {
    try {
        const user = await userService.getUserProfile(req.user._id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const updatedUser = await userService.updateUserProfile(req.user._id, req.body);
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
        }
        const result = await userService.changePassword(req.user._id, currentPassword, newPassword);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const result = await userService.deleteAccount(req.user._id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const toggleSaveVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const user = await userService.toggleSaveVehicle(req.user._id, vehicleId);
        res.status(200).json({ success: true, data: user.savedVehicles });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
    toggleSaveVehicle
};
