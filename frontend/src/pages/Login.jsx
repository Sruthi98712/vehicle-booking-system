import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button, Paper,
    Link, CircularProgress, MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/v1/auth/login', { email, password });
            const userData = res.data.data;
            localStorage.setItem('user', JSON.stringify(userData));
            toast.success('Login successful!');
            if (userData.role === 'admin') navigate('/admin-dashboard');
            else if (userData.role === 'vendor') navigate('/vendor/dashboard');
            else navigate('/customer-dashboard');
            window.location.reload(); // To refresh Navbar state
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 10 }}>
            <Paper sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, textAlign: 'center' }}>Login</Typography>
                <form onSubmit={handleLogin}>
                    <TextField
                        label="Email"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        sx={{ mb: 3 }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button
                        variant="contained"
                        fullWidth
                        type="submit"
                        disabled={loading}
                        sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Sign In'}
                    </Button>
                </form>
                <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
                    Don't have an account? <Link href="/register">Register</Link>
                </Typography>
            </Paper>
        </Box>
    );
}
