const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { fakerEN_IN } = require('@faker-js/faker');
const User = require('../models/user.model');
const Vendor = require('../models/vendor.model');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/booking.model');
const AuditLog = require('../models/auditLog.model');

// Load env vars
dotenv.config({ path: './backend/.env' });

const faker = fakerEN_IN;

// Connect DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected')).catch(err => console.log(err));

const generateMobile = () => '9' + Math.floor(100000000 + Math.random() * 900000000).toString();

const seedData = async () => {
    try {
        console.log('🗑️ Clearing Database...');
        await User.deleteMany({});
        await Vendor.deleteMany({});
        await Vehicle.deleteMany({});
        await Booking.deleteMany({});
        await AuditLog.deleteMany({});

        console.log('🌱 Seeding Admins...');
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@vms.com',
            password: 'password123',
            role: 'admin',
            mobile: generateMobile(),
            isMobileVerified: true
        });

        console.log('🌱 Seeding Customers...');
        const customers = [];
        for (let i = 0; i < 10; i++) {
            customers.push(await User.create({
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: 'password123',
                role: 'customer',
                mobile: generateMobile(),
                isMobileVerified: Math.random() > 0.3,
                city: faker.location.city()
            }));
        }

        console.log('🌱 Seeding Vendors...');
        const vendors = [];
        for (let i = 0; i < 5; i++) {
            const vendorUser = await User.create({
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: 'password123',
                role: 'vendor',
                mobile: generateMobile(),
                isMobileVerified: true
            });

            const vendorProfile = await Vendor.create({
                userId: vendorUser._id,
                businessName: faker.company.name() + ' Travels',
                businessEmail: vendorUser.email,
                businessPhone: vendorUser.mobile,
                status: 'APPROVED',
                verifiedBy: admin._id,
                verifiedAt: new Date(),
                address: {
                    street: faker.location.streetAddress(),
                    city: 'Hyderabad',
                    state: 'Telangana',
                    zipCode: '500081'
                }
            });
            vendors.push(vendorProfile);
        }

        console.log('🌱 Seeding Vehicles...');
        const vehicles = [];
        const vehicleTypes = ['SUV', 'Sedan', 'Hatchback', 'Luxury'];
        const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];

        for (const vendor of vendors) {
            for (let i = 0; i < 3; i++) {
                vehicles.push(await Vehicle.create({
                    vendorId: vendor.userId,
                    make: faker.vehicle.manufacturer(),
                    model: faker.vehicle.model(),
                    year: faker.number.int({ min: 2015, max: 2024 }),
                    licensePlate: `TS ${faker.number.int({ min: 10, max: 99 })} ${faker.string.alpha(2).toUpperCase()} ${faker.number.int({ min: 1000, max: 9999 })}`,
                    rentalPricePerDay: faker.commerce.price({ min: 500, max: 5000, dec: 0 }),
                    type: faker.helpers.arrayElement(vehicleTypes),
                    fuelType: faker.helpers.arrayElement(fuelTypes),
                    transmission: faker.helpers.arrayElement(['Manual', 'Automatic']),
                    city: 'Hyderabad',
                    available: true,
                    isFeatured: Math.random() > 0.8,
                    priceCategory: faker.helpers.arrayElement(['low', 'medium', 'high'])
                }));
            }
        }

        console.log('🌱 Seeding Bookings...');
        const allVehicles = await Vehicle.find({});

        for (let i = 0; i < 10; i++) {
            const customer = faker.helpers.arrayElement(customers);
            const vehicle = faker.helpers.arrayElement(allVehicles);
            const startDate = faker.date.future();
            const endDate = new Date(startDate.getTime() + 86400000 * 2); // 2 days later

            await Booking.create({
                userId: customer._id,
                vehicleId: vehicle._id,
                startDate: startDate,
                endDate: endDate,
                totalAmount: vehicle.rentalPricePerDay * 2,
                status: faker.helpers.arrayElement(['pending', 'confirmed', 'completed', 'cancelled']),
                paymentStatus: 'paid'
            });
        }

        console.log('✅ Seeding Completed Successfully!');
        process.exit();
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
};

seedData();
