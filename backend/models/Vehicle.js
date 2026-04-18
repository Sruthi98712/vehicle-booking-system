const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  make: { type: String, required: true },        // e.g., Toyota
  model: { type: String, required: true },       // e.g., Corolla
  year: { type: Number, required: true },        // e.g., 2020
  licensePlate: { type: String, required: true, unique: true },
  rentalPricePerDay: { type: Number, required: true },
  available: { type: Boolean, default: true },   // availability
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  commissionRate: { type: Number, default: 10 }, // Percentage
  pricingHistory: [{
    price: { type: Number },
    reason: { type: String },
    date: { type: Date, default: Date.now }
  }],
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalTrips: { type: Number, default: 0 },
  city: { type: String, index: true },
  type: { type: String, enum: ['car', 'bike', 'auto', 'van', 'truck', 'tractor', 'bus', 'cycle'], default: 'car' },
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], default: 'Petrol' },
  transmission: { type: String, enum: ['Manual', 'Automatic'], default: 'Manual' },
  availabilityDates: [{ from: Date, to: Date }],
  isFeatured: { type: Boolean, default: false },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  priceCategory: { type: String, enum: ['low', 'medium', 'high'] },
  images: [{ type: String }],
  description: { type: String },
  createdAt: { type: Date, default: Date.now, index: true }
});

VehicleSchema.index({ location: '2dsphere' });
VehicleSchema.index({ rentalPricePerDay: 1 });
VehicleSchema.index({ type: 1 });

module.exports = mongoose.model('Vehicle', VehicleSchema);
