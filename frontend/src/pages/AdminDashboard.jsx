import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Paper, Card, CardContent,
    Avatar, CircularProgress
} from '@mui/material';
import {
    DirectionsCar as CarIcon,
    Book as BookingIcon,
    MonetizationOn as RevenueIcon,
    People as UserIcon
} from '@mui/icons-material';
import RevenueChart from '../components/analytics/RevenueChart';
import BookingTrendChart from '../components/analytics/BookingTrendChart';
import api from '../api';
import { toast } from 'react-toastify';
import { Divider } from '@mui/material';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/v1/dashboard/admin');
                setData(res.data.data);
            } catch (err) {
                toast.error('Error fetching admin dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (!data) return null;

    const StatCard = ({ title, value, icon, color }) => (
        <Card sx={{
            borderRadius: 5,
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: `0 25px 50px -12px ${color}30`,
                borderColor: `${color}40`,
                '& .stat-avatar': {
                    transform: 'scale(1.1) rotate(5deg)',
                }
            },
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 4 }}>
                <Avatar
                    className="stat-avatar"
                    sx={{
                        background: `linear-gradient(135deg, ${color} 0%, ${color}aa 100%)`,
                        color: 'white',
                        mr: 3,
                        width: 72,
                        height: 72,
                        boxShadow: `0 10px 20px ${color}30`,
                        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    {React.cloneElement(icon, { sx: { fontSize: 34 } })}
                </Avatar>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#64748b', mb: 0.5, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                        {title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1, letterSpacing: -1 }}>
                        {value}
                    </Typography>
                </Box>
            </CardContent>
            <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: 5,
                background: `linear-gradient(90deg, ${color} 0%, ${color}44 100%)`,
                opacity: 0.9
            }} />
        </Card>
    );

    return (
        <Box sx={{ mt: 4, pb: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 900, mb: 4, color: '#0f172a' }}>Admin Dashboard</Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Vehicles" value={data.summary.vehicles} icon={<CarIcon />} color="#3b82f6" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Bookings" value={data.summary.bookings} icon={<BookingIcon />} color="#10b981" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Users" value={data.summary.users} icon={<UserIcon />} color="#8b5cf6" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Revenue" value={`$${data.summary.revenue}`} icon={<RevenueIcon />} color="#f59e0b" />
                </Grid>
            </Grid>

            <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                    <RevenueChart data={data.charts.revenue} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <BookingTrendChart data={data.charts.bookings} />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 4, borderRadius: 4, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 800, color: '#1e293b', mb: 3 }}>Top Performing Vehicles</Typography>
                        <Box sx={{ mt: 2 }}>
                            {data.charts.topVehicles.map((vehicle, index) => (
                                <React.Fragment key={index}>
                                    <Box sx={{
                                        py: 2,
                                        px: 1,
                                        borderRadius: 2,
                                        transition: 'background 0.2s',
                                        '&:hover': { bgcolor: 'grey.50' }
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 1
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar sx={{
                                                    width: 28,
                                                    height: 28,
                                                    bgcolor: 'primary.main',
                                                    mr: 2,
                                                    fontSize: 12,
                                                    fontWeight: 800
                                                }}>
                                                    {index + 1}
                                                </Avatar>
                                                <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                                    {vehicle.name}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={`${vehicle.count} Bookings`}
                                                size="small"
                                                sx={{
                                                    fontWeight: 800,
                                                    bgcolor: 'primary.lighter',
                                                    color: 'primary.main',
                                                    borderRadius: 1.5
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{
                                            height: 8,
                                            width: '100%',
                                            bgcolor: '#f1f5f9',
                                            borderRadius: 4,
                                            overflow: 'hidden'
                                        }}>
                                            <Box sx={{
                                                height: '100%',
                                                width: `${Math.min((vehicle.count / (data.charts.topVehicles[0]?.count || 1)) * 100, 100)}%`,
                                                background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                                                borderRadius: 4,
                                                transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                            }} />
                                        </Box>
                                    </Box>
                                    {index < data.charts.topVehicles.length - 1 && <Divider sx={{ my: 0.5, borderStyle: 'dashed' }} />}
                                </React.Fragment>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
