const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

const getUserProfile = async (userId) => {
    const user = await User.findById(userId).select('-password').populate('savedVehicles').lean();
    if (!user || user.isDeleted) {
        throw new Error('User not found');
    }

    if (user.role === 'vendor') {
        user.vendorProfile = await require('../models/vendor.model').findOne({ userId });
    }

    return user;
};

const updateUserProfile = async (userId, updateData) => {
    const { name, phone, preferences, city, state, country, profileImage } = updateData;

    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
        throw new Error('User not found');
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (city) user.city = city;
    if (state) user.state = state;
    if (country) user.country = country;
    if (profileImage) user.profileImage = profileImage;

    if (preferences) {
        if (preferences.notifications) {
            user.preferences.notifications = {
                ...user.preferences.notifications,
                ...preferences.notifications
            };
        }
    }

    const savedUser = await user.save();

    // Handle Vendor Location Update
    if (user.role === 'vendor') {
        const Vendor = require('../models/vendor.model');
        const { latitude, longitude, addressLine } = updateData;

        if (latitude || longitude || addressLine) {
            await Vendor.findOneAndUpdate(
                { userId },
                {
                    $set: {
                        'location.latitude': latitude,
                        'location.longitude': longitude,
                        'location.address': addressLine
                    }
                },
                { upsert: false }
            );
        }
    }

    return savedUser;
};

const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
        throw new Error('User not found');
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        throw new Error('Incorrect current password');
    }

    user.password = newPassword;
    await user.save();
    return { message: 'Password changed successfully' };
};

const deleteAccount = async (userId) => {
    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
        throw new Error('User not found');
    }

    user.isDeleted = true;
    await user.save();
    return { message: 'Account deleted successfully' };
};

const toggleSaveVehicle = async (userId, vehicleId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const index = user.savedVehicles.indexOf(vehicleId);
    if (index === -1) {
        user.savedVehicles.push(vehicleId);
    } else {
        user.savedVehicles.splice(index, 1);
    }

    await user.save();
    return user;
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    changePassword,
    deleteAccount,
    toggleSaveVehicle
};
