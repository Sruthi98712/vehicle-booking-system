import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, TextField, Button, Paper, Grid,
    Divider, CircularProgress, Alert
} from '@mui/material';
import api from '../api';
import { toast } from 'react-toastify';
import RatingDisplay from '../components/RatingDisplay';
import {
    Store as VendorIcon,
    History as HistoryIcon,
    DirectionsCar as CarIcon,
    LocationOn as LocationIcon
} from '@mui/icons-material';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

export default function BookVehicle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "REPLACE_WITH_YOUR_KEY"
    });

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const vRes = await api.get(`/vehicles/${id}`);
                setVehicle(vRes.data);
                try {
                    const vnRes = await api.get(`/vehicles/vendor/${id}`);
                    setVendor(vnRes.data);
                } catch (vErr) {
                    console.error('Vendor details fetch failed', vErr);
                }
            } catch (err) {
                toast.error('Error fetching details');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    useEffect(() => {
        if (startDate && endDate && vehicle) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            if (diffDays > 0) {
                setTotalPrice(diffDays * vehicle.rentalPricePerDay);
            } else {
                setTotalPrice(0);
            }
        }
    }, [startDate, endDate, vehicle]);

    const handleBooking = async () => {
        if (!startDate || !endDate) {
            toast.warning('Please select start and end dates');
            return;
        }
        if (new Date(endDate) < new Date(startDate)) {
            toast.warning('End date cannot be before start date');
            return;
        }
        try {
            const res = await api.post('/v1/bookings', {
                vehicleId: id,
                startDate,
                endDate,
                totalAmount: Number(totalPrice)
            });
            toast.success('Booking created successfully!');
            navigate('/my-bookings');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error creating booking');
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (!vehicle) return <Alert severity="error">Vehicle not found</Alert>;

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, mb: 10 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>Book Vehicle</Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 4, borderRadius: 4, mb: 3 }}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }} gutterBottom>
                                    {vehicle.make} {vehicle.model}
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                    {vehicle.type} • {vehicle.year}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>License Plate: <b>{vehicle.licensePlate}</b></Typography>

                                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                                    <RatingDisplay rating={vehicle.averageRating || 0} totalRatings={vehicle.totalReviews || 0} />
                                </Box>

                                <Typography variant="h4" sx={{ mt: 3, fontWeight: 800 }}>
                                    ${vehicle.rentalPricePerDay} <Typography variant="caption" sx={{ fontSize: 16 }}>/ day</Typography>
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box component="form">
                                    <TextField
                                        label="Start Date"
                                        type="date"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                    <TextField
                                        label="End Date"
                                        type="date"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Total Price:</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>${totalPrice}</Typography>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        onClick={handleBooking}
                                        sx={{ borderRadius: 3, py: 1.5, fontWeight: 700, fontSize: '1.1rem' }}
                                    >
                                        Confirm Booking
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    {vendor && (
                        <Paper sx={{ p: 4, borderRadius: 4, height: '100%', bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <VendorIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>Vendor Information</Typography>
                            </Box>

                            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>{vendor.name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{vendor.location}</Typography>

                            <Box sx={{ mb: 3 }}>
                                <RatingDisplay rating={vendor.averageRating || 0} totalRatings={vendor.totalRatings || 0} />
                            </Box>

                            {isLoaded && vendor?.address?.coordinates && (
                                <Box sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', height: 180, border: '1px solid', borderColor: 'divider' }}>
                                    <GoogleMap
                                        mapContainerStyle={{ width: '100%', height: '100%' }}
                                        center={{
                                            lat: Number(vendor.address.coordinates.lat),
                                            lng: Number(vendor.address.coordinates.lng)
                                        }}
                                        zoom={14}
                                        options={{ disableDefaultUI: true, zoomControl: false }}
                                    >
                                        <Marker
                                            position={{
                                                lat: Number(vendor.address.coordinates.lat),
                                                lng: Number(vendor.address.coordinates.lng)
                                            }}
                                        />
                                    </GoogleMap>
                                </Box>
                            )}
                            {!isLoaded && vendor?.address?.coordinates && (
                                <Box sx={{ mb: 3, height: 180, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            )}

                            <Divider sx={{ my: 3 }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CarIcon sx={{ fontSize: 20, mr: 1.5, color: 'text.secondary' }} />
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1 }}>{vendor.totalVehicles}</Typography>
                                        <Typography variant="caption" color="text.secondary">Total Vehicles</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <HistoryIcon sx={{ fontSize: 20, mr: 1.5, color: 'text.secondary' }} />
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1 }}>{vendor.totalTrips}</Typography>
                                        <Typography variant="caption" color="text.secondary">Success Trips</Typography>
                                    </Box>
                                </Box>

                                {vendor.address?.coordinates && (
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        color="primary"
                                        startIcon={<LocationIcon />}
                                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${vendor.address.coordinates.lat},${vendor.address.coordinates.lng}`, '_blank')}
                                        sx={{ borderRadius: 2, mt: 1, textTransform: 'none', fontWeight: 700 }}
                                    >
                                        Get Directions
                                    </Button>
                                )}
                            </Box>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
}
