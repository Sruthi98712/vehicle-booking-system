const Vehicle = require('../models/Vehicle');

// @desc    Get nearby vehicles within a radius
// @route   GET /api/vehicles/nearby
// @access  Public
const getNearbyVehicles = async (req, res) => {
    try {
        const { latitude, longitude, radius = 10 } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Please provide latitude and longitude'
            });
        }

        // 6371 is the radius of Earth in km
        const radiusInRadians = Number(radius) / 6371;

        const vehicles = await Vehicle.find({
            location: {
                $geoWithin: {
                    $centerSphere: [[Number(longitude), Number(latitude)], radiusInRadians]
                }
            },
            available: true
        }).populate('vendorId', 'name rating averageRating city');

        const formattedVehicles = vehicles.map(v => ({
            vehicleId: v._id,
            vehicleName: `${v.make} ${v.model}`,
            vehicleType: v.type,
            pricePerDay: v.rentalPricePerDay,
            vendor: {
                vendorId: v.vendorId?._id,
                name: v.vendorId?.name || 'Unknown Vendor',
                rating: v.vendorId?.averageRating || v.averageRating || 0,
                location: v.vendorId?.city || v.city || 'Unknown'
            },
            location: {
                latitude: v.location.coordinates[1],
                longitude: v.location.coordinates[0]
            },
            image: v.images && v.images.length > 0 ? v.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'
        }));

        res.status(200).json({
            success: true,
            count: formattedVehicles.length,
            data: formattedVehicles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getNearbyVehicles
};
