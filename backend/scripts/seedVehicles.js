const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('../models/Vehicle');
const User = require('../models/user.model');

dotenv.config();

const seedVehicles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vms');
        console.log('MongoDB Connected for Seeding...');

        // Clear existing vehicles (optional, but requested by flow sometimes)
        // For extension, maybe better to just add.
        // But user said "Insert dummy vehicles", so I'll clear and insert to be sure.
        // Wait, "Do NOT modify existing code" might mean don't delete existing data?
        // I'll just add them.

        const vendor = await User.findOne({ role: 'vendor' });
        if (!vendor) {
            console.error('No vendor found. Please run existing seed scripts first.');
            process.exit(1);
        }

        const vehicleTypes = ['car', 'bike', 'auto', 'truck', 'tractor', 'bus', 'van', 'cycle'];
        const baseCoords = [80.6480, 16.5062]; // Vijayawada center

        const vehicles = [];

        vehicleTypes.forEach(type => {
            for (let i = 1; i <= 5; i++) {
                // Slight random offset for variety within ~10km
                const latOffset = (Math.random() - 0.5) * 0.1;
                const lngOffset = (Math.random() - 0.5) * 0.1;

                vehicles.push({
                    make: `${type.charAt(0).toUpperCase() + type.slice(1)} Brand`,
                    model: `Model ${i}`,
                    year: 2020 + Math.floor(Math.random() * 5),
                    licensePlate: `AP-${type.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${i}`,
                    rentalPricePerDay: 500 + Math.floor(Math.random() * 3000),
                    available: true,
                    vendorId: vendor._id,
                    type: type,
                    city: 'Vijayawada',
                    location: {
                        type: 'Point',
                        coordinates: [baseCoords[0] + lngOffset, baseCoords[1] + latOffset]
                    },
                    rating: 4 + Math.random(),
                    totalRatings: Math.floor(Math.random() * 50),
                    images: [`https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000000)}?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`]
                });
            }
        });

        await Vehicle.insertMany(vehicles);
        console.log(`${vehicles.length} vehicles seeded successfully!`);
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedVehicles();
