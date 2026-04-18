import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    TextField,
    Button,
    Paper,
    Divider,
    CircularProgress,
    Stack,
    Alert
} from '@mui/material';
import { Calendar, MapPin, CheckCircle } from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';

const CustomerBooking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState({
        startDate: '',
        endDate: '',
        pickupLocation: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const res = await api.get(`/v1/vehicles/${id}`);
                if (res.data.success) {
                    setVehicle(res.data.data);
                }
            } catch (error) {
                console.error('Error fetching vehicle:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVehicle();
    }, [id]);

    const handleInputChange = (e) => {
        setBookingData({ ...bookingData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await api.post('/v1/bookings', {
                vehicleId: id,
                vendorId: vehicle.vendorId?._id || vehicle.vendorId,
                ...bookingData
            });

            if (response.data.success) {
                toast.success('Booking created successfully!');
                navigate('/customer-dashboard'); // Standardizing redirect
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating booking');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
    if (!vehicle) return <Container sx={{ py: 8 }}><Alert severity="error">Vehicle not found.</Alert></Container>;

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Calendar size={32} /> Book This Vehicle
                </Typography>
                <Typography color="text.secondary" paragraph>
                    Complete the form below to book the {vehicle.make} {vehicle.model}.
                </Typography>

                <Divider sx={{ my: 4 }} />

                <Grid container spacing={4}>
                    <Grid item xs={12} md={5}>
                        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>Vehicle Summary</Typography>
                            <Box sx={{ mb: 2, overflow: 'hidden', borderRadius: 1 }}>
                                <img 
                                    src={vehicle.images?.[0] || 'https://via.placeholder.com/300x200'} 
                                    style={{ width: '100%', height: 'auto' }} 
                                />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{vehicle.make} {vehicle.model}</Typography>
                            <Typography variant="body2" color="text.secondary">{vehicle.type} • {vehicle.city}</Typography>
                            <Typography variant="h6" color="primary" sx={{ mt: 2 }}>₹{vehicle.rentalPricePerDay} / day</Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={7}>
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                <TextField
                                    fullWidth
                                    label="Start Date"
                                    type="date"
                                    name="startDate"
                                    required
                                    value={bookingData.startDate}
                                    onChange={handleInputChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    fullWidth
                                    label="End Date"
                                    type="date"
                                    name="endDate"
                                    required
                                    value={bookingData.endDate}
                                    onChange={handleInputChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    fullWidth
                                    label="Pickup Location"
                                    name="pickupLocation"
                                    required
                                    placeholder="Enter address or city"
                                    value={bookingData.pickupLocation}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: <MapPin size={18} style={{ marginRight: 8, color: 'grey' }} />
                                    }}
                                />
                                
                                <Box sx={{ pt: 2 }}>
                                    <Button 
                                        type="submit" 
                                        variant="contained" 
                                        fullWidth 
                                        size="large"
                                        disabled={submitting}
                                        sx={{ py: 1.5, fontWeight: 'bold' }}
                                    >
                                        {submitting ? <CircularProgress size={24} /> : 'Confirm and Book'}
                                    </Button>
                                </Box>
                                <Typography variant="caption" color="text.secondary" align="center" display="block">
                                    By clicking "Confirm and Book", you agree to the rental terms and conditions.
                                </Typography>
                            </Stack>
                        </form>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default CustomerBooking;
