const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('../models/booking.model');
const Vehicle = require('../models/Vehicle');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
};

const fixBookings = async () => {
    await connectDB();

    try {
        // 1. Get all bookings
        const bookings = await Booking.find({});
        console.log(`Found ${bookings.length} bookings to check.`);

        // 2. Get all valid vehicles
        const vehicles = await Vehicle.find({});
        if (vehicles.length === 0) {
            console.log('No vehicles found in database. Run seed:vehicles first.');
            process.exit(1);
        }

        const vendor = await User.findOne({ role: 'vendor' });
        if (!vendor) {
            console.log('No vendor found. Please create a vendor user first.');
            process.exit(1);
        }

        // 3. Fix missing ownerId in vehicles
        let vehicleFixed = 0;
        for (const vehicle of vehicles) {
            if (!vehicle.ownerId) {
                vehicle.ownerId = vendor._id;
                await vehicle.save();
                vehicleFixed++;
            }
        }
        console.log(`Fixed ownerId for ${vehicleFixed} vehicles.`);

        let fixedCount = 0;
        for (const booking of bookings) {
            // Check if vehicle exists
            const vehicleExists = await Vehicle.findById(booking.vehicleId);

            if (!vehicleExists) {
                // Orphaned booking - link to a random valid vehicle
                const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
                booking.vehicleId = randomVehicle._id;

                // If it was confirmed/paid, mark as completed so review button shows
                if (booking.paymentStatus === 'paid' && (booking.status === 'confirmed' || booking.status === 'pending')) {
                    booking.status = 'completed';
                }

                await booking.save();
                fixedCount++;
            } else {
                // Fix booking status if needed
                if (booking.paymentStatus === 'paid' && (booking.status === 'confirmed' || booking.status === 'pending')) {
                    booking.status = 'completed';
                    await booking.save();
                    fixedCount++;
                }

                // Ensure vehicle has an owner (redundant but safe)
                if (!vehicleExists.ownerId) {
                    vehicleExists.ownerId = vendor._id;
                    await vehicleExists.save();
                }
            }
        }

        console.log(`Successfully fixed ${fixedCount} booking records.`);

    } catch (err) {
        console.error('Error fixing bookings:', err);
    } finally {
        mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit();
    }
};

fixBookings();
