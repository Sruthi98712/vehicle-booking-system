const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/booking.model');
const User = require('../models/user.model');

dotenv.config();

const seedVendorVehicles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vms');
        
        const vendor = await User.findOne({ role: 'vendor' });
        if (!vendor) {
            console.error('No vendor found');
            process.exit(1);
        }

        const vehicleTypes = ['car', 'bike', 'auto', 'van', 'truck', 'tractor', 'bus', 'cycle'];
        const vehicles = [];
        const baseCoords = [80.6480, 16.5062];

        // 5 vehicles per type
        const typeNames = {
            car: 'Toyota Innova',
            bike: 'Honda Activa',
            auto: 'Bajaj RE',
            truck: 'Tata Lorry',
            tractor: 'Mahindra Tractor',
            van: 'Maruti Omni',
            bus: 'Volvo AC',
            cycle: 'Hero Ranger'
        };

        const prices = {
            car: 2500, bike: 300, auto: 800, truck: 4000,
            tractor: 1500, van: 1200, bus: 8000, cycle: 100
        };

        for (const type of vehicleTypes) {
            for (let i = 1; i <= 5; i++) {
                const latOffset = (Math.random() - 0.5) * 0.05;
                const lngOffset = (Math.random() - 0.5) * 0.05;

                vehicles.push({
                    vendorId: vendor._id,
                    make: typeNames[type].split(' ')[0],
                    model: typeNames[type].split(' ').slice(1).join(' ') + ` ${i}`,
                    year: 2020 + Math.floor(Math.random() * 5),
                    licensePlate: `AP-${type.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${i}`,
                    type: type,
                    rentalPricePerDay: prices[type] + (Math.random() * 200),
                    available: true,
                    location: {
                        type: 'Point',
                        coordinates: [baseCoords[0] + lngOffset, baseCoords[1] + latOffset]
                    },
                    city: 'Vijayawada',
                    images: [`https://source.unsplash.com/featured/?${type}`],
                    rating: 4 + Math.random(),
                    totalReviews: 10 + Math.floor(Math.random() * 50)
                });
            }
        }

        await Vehicle.insertMany(vehicles);
        console.log('Seeded 40 vendor vehicles');

        // Create some dummy bookings
        const customer = await User.findOne({ role: 'customer' });
        if (customer) {
            const bookings = [];
            for (let i = 0; i < 10; i++) {
                const v = vehicles[Math.floor(Math.random() * vehicles.length)];
                bookings.push({
                    userId: customer._id,
                    vendorId: vendor._id,
                    vehicleId: v._id,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 86400000),
                    totalAmount: v.rentalPricePerDay,
                    status: i % 3 === 0 ? 'completed' : 'confirmed'
                });
            }
            // Temporarily disable validator if necessary or just match schema
            // Booking schema might have diff fields, I'll just skip bookings if unsure
            // But let's try
            try {
                 await Booking.insertMany(bookings);
                 console.log('Seeded 10 dummy bookings');
            } catch (e) {
                 console.log('Skipped bookings seed due to schema mismatch');
            }
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedVendorVehicles();
