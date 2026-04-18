# 🚗 RentalX - Advanced Vehicle Rental Management System

RentalX is a production-ready, full-stack MERN (MongoDB, Express, React, Node.js) application designed for high-performance vehicle rental management. It features a premium, responsive UI with advanced geospatial search, vendor dashboards, and secure authentication.

## ✨ Key Features

- **Premium UI/UX**: Built with React, Tailwind CSS, and Framer Motion for smooth, high-fidelity interactions.
- **Geospatial Discovery**: Radius-based search to find vehicles near your current location.
- **Vendor Ecosystem**: Dedicated flow for vendors to manage fleets, track bookings, and view real-time revenue analytics.
- **Secure Authentication**: JWT-based auth with Zod validation, role-based access control (Admin/Vendor/Customer), and security middleware.
- **Real-time Updates**: Integrated with Socket.io for live booking status and location tracking.
- **Robust Analytics**: Dynamic dashboard with MongoDB aggregation-driven statistics.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide React, Axios, MUI.
- **Backend**: Node.js, Express 5, MongoDB (Mongoose), Socket.io, Zod, JWT, Bcrypt.
- **Security**: Express Rate Limit, Cookie Parser, CORS protection.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Running locally or on Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/rentalx-vms.git
   cd rentalx-vms
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file based on the example provided below
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file with VITE_API_BASE_URL=http://localhost:5000/api
   npm run dev
   ```

## 📄 Environment Configuration

### Backend (.env)
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🏗 Project Structure

```text
├── backend/
│   ├── controllers/    # API Request Handlers
│   ├── models/         # Mongoose Schemas
│   ├── routes/         # API Endpoints
│   ├── services/       # Business Logic
│   └── middleware/     # Auth & Security
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI Components
│   │   ├── pages/      # Route Pages
│   │   ├── context/    # React Context (Socket, etc)
│   │   └── api/        # Axios Instance
└── README.md
```

## 🚀 Future Enhancements

> ⚠️ Note: This project is currently a prototype. The following improvements are planned for future versions.

1. **User Verification System**
   - Mobile number verification using OTP
   - Email verification using OTP for secure authentication

2. **Payment Integration**
   - Direct payment gateway integration (e.g., UPI / Cards)
   - Automated receipt generation for both vendors and customers

3. **UI/UX Improvements**
   - Enhanced and modernized user interface
   - Improved user experience with better responsiveness and design consistency

4. **AI-Based Features**
   - Smart AI suggestions for users
   - Integrated chatbot for assistance
   - AI-based description generation for vendors

5. **Form Validations & Security**
   - Strong validation for login and registration
   - Input validation across all required fields
   - Improved error handling and user feedback

6. **Scalability & Performance**
   - Backend optimization for handling larger user base
   - Efficient data fetching and caching mechanisms

7. **Advanced Features (Optional)**
   - Real-time tracking improvements
   - Notification system (SMS/Email/Push Notifications)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚖️ License

This project is licensed under the MIT License.
