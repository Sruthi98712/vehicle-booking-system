const bookingService = require('../services/booking.service');
const Booking = require('../models/booking.model');
const Vehicle = require('../models/Vehicle');

const createBooking = async (req, res) => {
    try {
        const bookingData = {
            ...req.body,
            userId: req.user._id
        };
        const booking = await bookingService.createBooking(bookingData);

        // Notify Vendor
        const vehicle = await Vehicle.findById(booking.vehicleId);
        const io = req.app.get('io');
        if (io) {
            io.emit(`vendor_notification_${vehicle.vendorId}`, {
                type: 'NEW_BOOKING',
                message: `New booking for ${vehicle.make} ${vehicle.model}`,
                bookingId: booking._id
            });
        }

        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id, hiddenByCustomer: { $ne: true } })
            .populate({
                path: 'vehicleId',
                populate: { path: 'vendorId', select: 'name city averageRating' }
            })
            .lean();

        const extendedBookings = await Promise.all(bookings.map(async (b) => {
            if (!b.vehicleId || !b.vehicleId.vendorId) return b;

            const vendorId = b.vehicleId.vendorId._id;
            const totalVehicles = await Vehicle.countDocuments({ vendorId });

            return {
                ...b,
                vendor: {
                    name: b.vehicleId.vendorId.name,
                    city: b.vehicleId.vendorId.city,
                    averageRating: b.vehicleId.vendorId.averageRating,
                    totalVehicles
                }
            };
        }));

        res.json({ success: true, data: extendedBookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllBookings = async (req, res) => {
    try {
        const filter = {};
        if (req.user.role === 'vendor') {
            const myVehicles = await Vehicle.find({ vendorId: req.user._id }).select('_id');
            filter.vehicleId = { $in: myVehicles.map(v => v._id) };
        }

        const bookings = await Booking.find(filter)
            .populate('userId', 'name city averageRating phone')
            .populate({
                path: 'vehicleId',
                populate: { path: 'vendorId', select: 'name city averageRating' }
            })
            .sort({ createdAt: -1 })
            .lean();

        const extendedBookings = bookings.map(b => {
            const data = { ...b };
            if (b.userId) {
                data.customer = {
                    name: b.userId.name,
                    city: b.userId.city,
                    averageRating: b.userId.averageRating,
                    phone: b.userId.phone
                };
            }
            if (b.vehicleId && b.vehicleId.vendorId) {
                data.vendor = {
                    name: b.vehicleId.vendorId.name,
                    city: b.vehicleId.vendorId.city,
                    averageRating: b.vehicleId.vendorId.averageRating
                };
            }
            return data;
        });

        res.json({ success: true, data: extendedBookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });

        // Notify Customer
        const io = req.app.get('io');
        if (io) {
            io.emit(`customer_notification_${booking.userId}`, {
                type: 'BOOKING_UPDATE',
                message: `Your booking status has been updated to ${status}`,
                bookingId: booking._id,
                status
            });
        }

        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getBookingDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id)
            .populate('userId', 'name email phone profileImage')
            .populate('vendorId', 'name email phone')
            .populate({
                path: 'vehicleId',
                select: 'make model year licensePlate rentalPricePerDay'
            })
            .populate({
                path: 'vendorId',
                select: 'businessName businessEmail businessPhone address location'
            })
            .lean();

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Authorization check
        const isCustomer = booking.userId._id.toString() === req.user._id.toString();
        const isVendor = booking.vendorId.userId?.toString() === req.user._id.toString() || booking.vendorId._id.toString() === req.user._id.toString();
        // Note: vendorId in booking might be the User ID or Vendor ID depending on how it was saved. 
        // Based on my previous change in booking.service.js: vendorId: vehicle.vendorId (which is a User ID ref in Vehicle schema)

        if (!isCustomer && !isVendor && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized to view these details' });
        }

        const vendorUser = await require('../models/user.model').findById(booking.vendorId);
        const vendorProfile = await require('../models/vendor.model').findOne({ userId: booking.vendorId });

        res.json({
            success: true,
            data: {
                bookingId: booking._id,
                startDate: booking.startDate,
                endDate: booking.endDate,
                status: booking.status,
                vehicle: booking.vehicleId,
                customer: {
                    name: booking.userId.name,
                    email: booking.userId.email,
                    phone: booking.userId.phone || booking.userId.mobile
                },
                vendor: {
                    name: vendorProfile?.businessName || vendorUser?.name,
                    email: vendorProfile?.businessEmail || vendorUser?.email,
                    phone: vendorProfile?.businessPhone || vendorUser?.phone,
                    location: vendorProfile?.location || {
                        address: vendorProfile?.address?.city || vendorUser?.city,
                        latitude: vendorProfile?.address?.coordinates?.lat,
                        longitude: vendorProfile?.address?.coordinates?.lng
                    }
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const bulkDeleteBookings = async (req, res) => {
    try {
        const { bookingIds } = req.body;
        if (!bookingIds || !Array.isArray(bookingIds)) {
            return res.status(400).json({ success: false, message: 'Invalid booking IDs' });
        }

        await Booking.updateMany(
            { _id: { $in: bookingIds }, userId: req.user._id },
            { $set: { hiddenByCustomer: true } }
        );

        res.json({ success: true, message: 'Booking history updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getAllBookings,
    updateBookingStatus,
    getBookingDetails,
    bulkDeleteBookings
};
