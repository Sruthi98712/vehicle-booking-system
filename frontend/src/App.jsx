import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import theme from './theme';
import PublicLayout from './components/PublicLayout';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Vehicles from './pages/Vehicles';
import BookVehicle from './pages/BookVehicle';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';

import CustomerDashboard from './pages/CustomerDashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SavedVehicles from './pages/SavedVehicles';
import HelpSupport from './pages/HelpSupport';
import Login from './pages/Login';
import VendorKYC from './pages/VendorKYC';
import AdminDocumentReview from './pages/AdminDocumentReview';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import NearbySearch from './pages/NearbySearch';
import { SocketProvider } from './context/SocketContext';
import TrackBooking from './pages/TrackBooking';
import OurVision from './pages/OurVision';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Legal from './pages/Legal';
import BrowseVehicles from './pages/BrowseVehicles';
import VehicleTypeListing from './pages/VehicleTypeListing';
import VehicleDetail from './pages/VehicleDetail';
import CustomerBooking from './pages/CustomerBooking';
import MapVehicles from './pages/MapVehicles';
import VendorLayout from './components/VendorLayout';
import VendorDashboardNew from './pages/VendorDashboardNew';
import VendorAddVehicle from './pages/VendorAddVehicle';
import VendorVehicles from './pages/VendorVehicles';
import VendorBookings from './pages/VendorBookings';
import VendorVehicleCustomers from './pages/VendorVehicleCustomers';
import VendorProfile from './pages/VendorProfile';
import VendorEditVehicle from './pages/VendorEditVehicle';
import "./App.css"

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SocketProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/vehicles" element={<BrowseVehicles />} />
              <Route path="/nearby-search" element={<NearbySearch />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/vision" element={<OurVision />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/browse-vehicles" element={<BrowseVehicles />} />
              <Route path="/vehicles/type/:vehicleType" element={<VehicleTypeListing />} />
              <Route path="/vehicle/:id" element={<VehicleDetail />} />
              <Route path="/map-vehicles" element={<MapVehicles />} />
            </Route>

            {/* Protected Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/book/:id" element={<CustomerBooking />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/track-booking/:id" element={<TrackBooking />} />
                <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/customer-dashboard" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/saved-vehicles" element={<SavedVehicles />} />
                <Route path="/help-support" element={<HelpSupport />} />
                <Route path="/vendor-kyc" element={<ProtectedRoute allowedRoles={['vendor']}><VendorKYC /></ProtectedRoute>} />
                <Route path="/admin-document-review" element={<ProtectedRoute allowedRoles={['admin']}><AdminDocumentReview /></ProtectedRoute>} />
              </Route>

              {/* Vendor Flow (Premium Tailwind/Framer Pages) */}
              <Route path="/vendor" element={<ProtectedRoute allowedRoles={['vendor']}><VendorLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<VendorDashboardNew />} />
                <Route path="vehicles" element={<VendorVehicles />} />
                <Route path="vehicles/:type" element={<VendorVehicles />} />
                <Route path="vehicles/add" element={<VendorAddVehicle />} />
                <Route path="vehicles/edit/:id" element={<VendorEditVehicle />} />
                <Route path="bookings" element={<VendorBookings />} />
                <Route path="customers" element={<VendorVehicleCustomers />} />
                <Route path="vehicle/:vehicleId/customers" element={<VendorVehicleCustomers />} />
                <Route path="analytics" element={<VendorDashboardNew />} />
                <Route path="profile" element={<VendorProfile />} />
              </Route>
            </Route>
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </Router>
      </SocketProvider>
    </ThemeProvider>
  );
}
