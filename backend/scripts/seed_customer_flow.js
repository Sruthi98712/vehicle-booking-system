const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('../models/Vehicle');
const User = require('../models/user.model');
const Vendor = require('../models/vendor.model');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vms');
        console.log('Connected to MongoDB');

        // Create a vendor user if it doesn't exist
        let vendorUser = await User.findOne({ role: 'vendor' });
        if (!vendorUser) {
            console.log('No vendor user found. Creating dummy vendor...');
            vendorUser = await User.create({
                name: 'Dummy Vendor',
                email: 'vendor@example.com',
                password: 'password123', // In a real app, this should be hashed if the model doesn't handle it
                role: 'vendor',
                phone: '9876543210'
            });
            
            // Create a vendor profile
            await Vendor.create({
                userId: vendorUser._id,
                businessName: 'RentalX Vendors',
                businessEmail: 'vendor@example.com',
                businessPhone: '9876543210',
                status: 'APPROVED',
                address: {
                    city: 'Vijayawada'
                }
            });
        }

        const vehicleTypes = ['car', 'bike', 'auto', 'van', 'truck', 'tractor', 'bus', 'cycle'];
        const cities = ['Vijayawada', 'Guntur', 'Visakhapatnam', 'Hyderabad', 'Tirupati'];

        const dummyVehicles = [];

        for (const type of vehicleTypes) {
            for (let i = 1; i <= 3; i++) {
                dummyVehicles.push({
                    make: type.charAt(0).toUpperCase() + type.slice(1),
                    model: `Model ${i}`,
                    year: 2022 + i,
                    licensePlate: `${type.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${i}`,
                    rentalPricePerDay: 500 + Math.floor(Math.random() * 2000),
                    available: true,
                    vendorId: vendorUser._id,
                    city: cities[Math.floor(Math.random() * cities.length)],
                    type: type,
                    fuelType: 'Petrol',
                    transmission: 'Manual',
                    averageRating: 4.5,
                    images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'] // Placeholder image
                });
            }
        }

        await Vehicle.insertMany(dummyVehicles);
        console.log('Dummy vehicles seeded successfully');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
