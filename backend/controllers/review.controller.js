const Review = require('../models/review.model');
const Booking = require('../models/booking.model');
const User = require('../models/user.model');
const Vehicle = require('../models/Vehicle');

const createReview = async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body;
        const reviewerId = req.user._id;

        // 1. Find the booking
        const booking = await Booking.findById(bookingId).populate('vehicleId');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // 2. Verify booking status
        if (booking.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review completed bookings' });
        }

        // 3. Verify reviewer is authorized (must be customer or owner)
        const isCustomer = booking.userId && reviewerId && booking.userId.toString() === reviewerId.toString();
        const isOwner = booking.vehicleId && booking.vehicleId.ownerId && reviewerId &&
            booking.vehicleId.ownerId.toString() === reviewerId.toString();

        if (!isCustomer && !isOwner) {
            console.log('Authorization failed:', {
                bookingUser: booking.userId,
                reviewer: reviewerId,
                isCustomer,
                isOwner,
                vehicleOwner: booking.vehicleId?.ownerId
            });
            return res.status(403).json({ message: 'Not authorized to review this booking' });
        }

        // 4. Determine who is being reviewed
        const reviewFor = isCustomer ? booking.vehicleId?.ownerId : booking.userId;

        if (!reviewFor) {
            return res.status(400).json({ message: 'Target of review (vendor/customer) not found' });
        }

        // 5. Prevent duplicate reviews (already enforced by DB index, but good to check)
        const existingReview = await Review.findOne({ bookingId, reviewerId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this booking' });
        }

        // 5. Create Review
        const review = await Review.create({
            bookingId,
            vehicleId: booking.vehicleId,
            reviewerId,
            reviewFor,
            rating,
            comment
        });

        // 6. Update reviewFor User Ratings
        const user = await User.findById(reviewFor);
        if (user) {
            const oldAvg = user.averageRating;
            const totalRatings = user.totalRatings;
            const newTotal = totalRatings + 1;
            const newAvg = (oldAvg * totalRatings + rating) / newTotal;

            user.totalRatings = newTotal;
            user.averageRating = parseFloat(newAvg.toFixed(1));
            await user.save();
        }

        // 7. Update Vehicle Rating if Customer is reviewer
        if (isCustomer) {
            const vehicle = await Vehicle.findById(booking.vehicleId);
            if (vehicle) {
                const oldAvgV = vehicle.averageRating;
                const totalReviewsV = vehicle.totalReviews;
                const newTotalV = totalReviewsV + 1;
                const newAvgV = (oldAvgV * totalReviewsV + rating) / newTotalV;

                vehicle.totalReviews = newTotalV;
                vehicle.averageRating = parseFloat(newAvgV.toFixed(1));

                // Also update legacy fields for backward compatibility
                vehicle.rating = vehicle.averageRating;
                vehicle.totalRatings = vehicle.totalReviews;

                await vehicle.save();
            }
        }

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const reviews = await Review.find({ reviewFor: userId })
            .populate('reviewerId', 'name city state country profileImage')
            .sort({ createdAt: -1 });

        const user = await User.findById(userId).select('averageRating totalRatings');

        res.status(200).json({
            reviews,
            averageRating: user?.averageRating || 0,
            totalRatings: user?.totalRatings || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReview,
    getUserReviews
};
