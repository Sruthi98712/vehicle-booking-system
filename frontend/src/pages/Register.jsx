import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button, Paper,
    Link, CircularProgress, MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        city: '',
        state: '',
        role: 'customer'
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/v1/auth/register', formData);
            const userData = res.data.data; // Backend returns { success: true, data: { ... } }

            localStorage.setItem('user', JSON.stringify(userData));
            toast.success('Registration successful!');

            if (userData.role === 'admin') navigate('/admin-dashboard');
            else if (userData.role === 'vendor') navigate('/vendor/dashboard');
            else navigate('/customer-dashboard');

            window.location.reload();
        } catch (err) {
            const errorMsg = err.response?.data?.details?.join(', ') || err.response?.data?.message || 'Registration failed';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4, mb: 4 }}>
            <Paper sx={{ p: 5, borderRadius: 6, shadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, textAlign: 'center', tracking: '-0.05em', uppercase: true }}>Join RentalX</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center', fontWeight: 500 }}>Create your account to start your journey.</Typography>
                <form onSubmit={handleRegister}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextField
                            label="Full Name"
                            name="name"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <TextField
                            label="Mobile Number"
                            name="mobile"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={formData.mobile}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <TextField
                        label="Email Address"
                        name="email"
                        type="email"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <TextField
                            label="City"
                            name="city"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={formData.city}
                            onChange={handleChange}
                            required
                        />
                        <TextField
                            label="State"
                            name="state"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={formData.state}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        select
                        label="Account Type"
                        name="role"
                        fullWidth
                        sx={{ mb: 4 }}
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >
                        <MenuItem value="customer">Customer (Receiver)</MenuItem>
                        <MenuItem value="vendor">Vendor (Lender)</MenuItem>
                    </TextField>
                    <Button
                        variant="contained"
                        fullWidth
                        type="submit"
                        disabled={loading}
                        sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Register'}
                    </Button>
                </form>
                <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
                    Already have an account? <Link href="/login">Login</Link>
                </Typography>
            </Paper>
        </Box>
    );
}
