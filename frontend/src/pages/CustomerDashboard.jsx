import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Grid, Paper, Card, CardContent,
    Avatar, CircularProgress, Button, IconButton, Chip, Divider,
    Tooltip
} from '@mui/material';
import {
    Book as BookingIcon,
    Favorite as HeartIcon,
    AccountBalanceWallet as WalletIcon,
    DirectionsCar as CarIcon,
    Delete as DeleteIcon,
    ArrowForward as ArrowIcon,
    Star as StarIcon
} from '@mui/icons-material';
import api from '../api';
import { toast } from 'react-toastify';

export default function CustomerDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/v1/dashboard/customer');
                setData(res.data.data);
            } catch (err) {
                toast.error('Error fetching dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleRemoveSaved = async (vehicleId) => {
        try {
            await api.post(`/v1/users/toggle-save/${vehicleId}`);
            setData(prev => ({
                ...prev,
                savedVehicles: prev.savedVehicles.filter(v => v._id !== vehicleId)
            }));
            toast.success('Vehicle removed from saved');
        } catch (err) {
            toast.error('Error removing vehicle');
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (!data) return null;

    const StatCard = ({ title, value, icon, color }) => (
        <Card sx={{
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            height: '100%',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-5px)' }
        }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ background: `linear-gradient(135deg, ${color} 0%, ${color}aa 100%)`, color: 'white', mr: 3, width: 60, height: 60 }}>
                    {icon}
                </Avatar>
                <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>{title}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a' }}>{value}</Typography>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ pb: 10 }}>
            {/* Header */}
            <Box sx={{ mb: 6, mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 950, letterSpacing: -1.5, color: '#0f172a' }}>
                        RENTALX<span style={{ color: '#3b82f6' }}>.</span>
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Welcome back! Here's your activity overview.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    endIcon={<ArrowIcon />}
                    onClick={() => navigate('/browse-vehicles')}
                    sx={{ borderRadius: 3, px: 3, py: 1.5, fontWeight: 700, textTransform: 'none', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.5)' }}
                >
                    Browse Vehicles
                </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid item xs={12} sm={4}>
                    <StatCard title="My Bookings" value={data.totalBookings} icon={<BookingIcon />} color="#3b82f6" />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatCard title="Total Spent" value={`$${data.totalSpent}`} icon={<WalletIcon />} color="#10b981" />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatCard title="Saved Vehicles" value={data.savedVehicles.length} icon={<HeartIcon />} color="#f43f5e" />
                </Grid>
            </Grid>

            <Grid container spacing={4}>
                {/* Recent Bookings */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 4, borderRadius: 5, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Recent Activity</Typography>
                            <Button size="small" onClick={() => navigate('/my-bookings')} sx={{ fontWeight: 700, textTransform: 'none' }}>View All</Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {data.recentBookings.length === 0 ? (
                                <Box sx={{ py: 6, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 4, border: '1px dashed #e2e8f0' }}>
                                    <BookingIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
                                    <Typography color="text.secondary" variant="body2">You haven't made any bookings yet.</Typography>
                                </Box>
                            ) : (
                                data.recentBookings.map((booking) => (
                                    <Paper key={booking._id} sx={{ p: 2, borderRadius: 3, border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', '&:hover': { bgcolor: '#f8fafc' } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', width: 44, height: 44 }}><CarIcon /></Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 800 }}>{booking.vehicleId?.make} {booking.vehicleId?.model}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                    {new Date(booking.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 900, mb: 0.5 }}>${booking.totalAmount}</Typography>
                                            <Chip
                                                label={booking.status.toUpperCase()}
                                                size="small"
                                                sx={{
                                                    fontWeight: 900,
                                                    fontSize: '0.65rem',
                                                    bgcolor: booking.status === 'confirmed' ? '#dcfce7' : '#fef9c3',
                                                    color: booking.status === 'confirmed' ? '#166534' : '#854d0e'
                                                }}
                                            />
                                        </Box>
                                    </Paper>
                                ))
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Saved Vehicles */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 4, borderRadius: 5, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: '100%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 4 }}>Saved Vehicles</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {data.savedVehicles.length === 0 ? (
                                <Box sx={{ py: 6, textAlign: 'center', border: '2px dashed #e2e8f0', borderRadius: 4 }}>
                                    <HeartIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1.5, opacity: 0.5 }} />
                                    <Typography color="text.secondary" variant="body2">Your wishlist is empty.</Typography>
                                    <Button variant="text" size="small" sx={{ mt: 1, fontWeight: 700 }} onClick={() => navigate('/browse-vehicles')}>Start exploring</Button>
                                </Box>
                            ) : (
                                data.savedVehicles.map((vehicle) => (
                                    <Card key={vehicle._id} sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #f1f5f9', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', bgcolor: '#f0f9ff' } }}>
                                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '16px !important' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar variant="rounded" sx={{ bgcolor: '#fff1f2', color: '#f43f5e', width: 48, height: 48 }}>
                                                    <CarIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{vehicle.make} {vehicle.model}</Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>${vehicle.rentalPricePerDay}/day</Typography>
                                                        <Divider orientation="vertical" flexItem sx={{ height: 10, alignSelf: 'center' }} />
                                                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.6rem' }}>{vehicle.type}</Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Tooltip title="Remove">
                                                    <IconButton size="small" onClick={() => handleRemoveSaved(vehicle._id)} sx={{ color: '#94a3b8', '&:hover': { color: 'error.main', bgcolor: '#fff1f2' } }}>
                                                        <DeleteIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="View Details">
                                                    <IconButton size="small" onClick={() => navigate(`/vehicles/${vehicle._id}`)} sx={{ color: 'primary.main', '&:hover': { bgcolor: '#e0f2fe' } }}>
                                                        <ArrowIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
