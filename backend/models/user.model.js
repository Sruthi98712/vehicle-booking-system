const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'vendor', 'customer'],
    default: 'customer'
  },
  phone: { type: String, required: false }, // Removed default value to avoid duplicate empty strings
  mobile: { type: String, unique: true, required: true },
  isMobileVerified: { type: Boolean, default: false },
  googleId: { type: String, unique: true, sparse: true },
  otp: {
    code: String,
    expiresAt: Date
  },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  publicProfile: {
    bio: String,
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 }
  },
  privateData: {
    personalDocUrl: String,
    bankDetails: mongoose.Schema.Types.Mixed
  },
  totalRatings: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      bookingAlerts: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true }
    }
  },
  savedVehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }],
  createdAt: { type: Date, default: Date.now },
  refreshToken: { type: String }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('role') && this.role === 'admin') {
    const existingAdmin = await mongoose.models.User.findOne({ role: 'admin' });
    if (existingAdmin && existingAdmin._id.toString() !== this._id.toString()) {
      return next(new Error('Only one admin account is allowed in the system.'));
    }
  }

  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
