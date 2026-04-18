const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const vehiclesRouter = require('./routes/vehicles');
const authRouter = require('./routes/auth.routes');
const bookingRouter = require('./routes/booking.routes');
const dashboardRouter = require('./routes/dashboard.routes');
const paymentRouter = require('./routes/payment.routes');
const userRoutes = require('./routes/user.routes');
const analyticsRouter = require('./routes/analytics.routes');
const reviewRouter = require('./routes/review.routes');
const intelligenceRouter = require('./routes/intelligence.routes');
const adminRouter = require('./routes/admin.routes');

const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use(cors({
  origin:"vehicle-booking-system-ixnu.vercel.app"}));
app.use(limiter);
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/reviews', reviewRouter);

// Socket.io integration
app.set('io', io);
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_booking', (bookingId) => {
    socket.join(`booking_${bookingId}`);
    console.log(`User joined booking room: booking_${bookingId}`);
  });

  socket.on('update_location', ({ bookingId, location }) => {
    io.to(`booking_${bookingId}`).emit('location_update', {
      bookingId,
      location,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vms', {
  useNewUrlParser: true, useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const vendorRouter = require('./routes/vendor.routes');

// Routes
app.use('/api/v1/vehicles', vehiclesRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/vendors', vendorRouter);
app.use('/api/v1/intelligence', intelligenceRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/kyc', require('./routes/kyc.routes'));
app.use('/api/v1/customer', require('./routes/customer.routes'));
app.use('/api/v1/discovery', require('./routes/discovery.routes'));
app.use('/api/v1/vendor', require('./routes/vendorFlow.routes'));

// Centralized Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Basic health check
app.get('/', (req, res) => res.send('Vehicle Rental API is running'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
