import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Divider,
    Paper,
    Rating,
    CircularProgress,
    Stack,
    IconButton
} from '@mui/material';
import { MapPin, Phone, Mail, Calendar, Info, Star, ChevronRight, Navigation } from 'lucide-react';
import api from '../api';
import VendorProfileModal from '../components/VendorProfileModal';


const VehicleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [vendorModal, setVendorModal] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                    const vRes = await api.get(`/v1/vehicles/${id}`);
                    if (vRes.data.success) {
                        setVehicle(vRes.data.data);
                        
                        const vendorRes = await api.get(`/v1/vehicles/vendor-info/${id}`);
                        if (vendorRes.data.success) {
                            setVendor(vendorRes.data.data);
                        }
                    }
            } catch (error) {
                console.error('Error fetching vehicle details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
    if (!vehicle) return <Container sx={{ py: 8 }}><Typography align="center">Vehicle not found.</Typography></Container>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={4}>
                {/* Left Side: Vehicle Images and Info */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
                        <img 
                            src={vehicle.images?.[0] || 'https://via.placeholder.com/800x500?text=No+Vehicle+Image'} 
                            alt={vehicle.make}
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </Paper>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                            {vehicle.make} {vehicle.model}
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                            <Box sx={{ px: 2, py: 1, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1, textTransform: 'capitalize' }}>
                                {vehicle.type}
                            </Box>
                            <Box sx={{ px: 2, py: 1, bgcolor: 'grey.200', borderRadius: 1 }}>
                                {vehicle.fuelType}
                            </Box>
                            <Box sx={{ px: 2, py: 1, bgcolor: 'grey.200', borderRadius: 1 }}>
                                {vehicle.transmission}
                            </Box>
                        </Stack>
                        <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                            ₹{vehicle.rentalPricePerDay} / day
                        </Typography>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" gutterBottom>Vehicle Details</Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Experience the best of comfort and performance with this {vehicle.year} {vehicle.make} {vehicle.model}. 
                            Well-maintained and ready for your next journey.
                        </Typography>
                        
                        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Customer Reviews</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Rating value={vehicle.averageRating} readOnly precision={0.5} />
                            <Typography variant="subtitle1" sx={{ ml: 1 }}>
                                {vehicle.averageRating} ({vehicle.totalReviews || 0} reviews)
                            </Typography>
                        </Box>
                        {/* Placeholder for reviews */}
                        <Typography variant="body2" color="text.secondary">
                            No reviews yet for this vehicle.
                        </Typography>
                    </Box>
                </Grid>

                {/* Right Side: Vendor Info and Booking */}
                <Grid item xs={12} md={5}>
                    <Card sx={{ p: 3, mb: 3, position: 'sticky', top: 24 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Vendor Details</Typography>
                        {vendor ? (
                            <Box>
                                <Typography variant="h6" gutterBottom>{vendor.businessName}</Typography>
                                <Stack spacing={2} sx={{ my: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Phone size={18} color="grey" />
                                        <Typography variant="body2">{vendor.businessPhone}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Mail size={18} color="grey" />
                                        <Typography variant="body2">{vendor.businessEmail}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                        <MapPin size={18} color="grey" style={{ marginTop: 2 }} />
                                        <Typography variant="body2">
                                            {vendor.address?.city}, {vendor.address?.state}
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Star size={18} color="#faaf00" fill="#faaf00" />
                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                            {vendor.averageRating || vendor.rating} Average Rating
                                        </Typography>
                                    </Box>
                                    <Button 
                                        size="small" 
                                        sx={{ fontWeight: 800, textTransform: 'none' }} 
                                        onClick={() => setVendorModal(true)}
                                        endIcon={<ChevronRight size={14} />}
                                    >
                                        View Profile & Reviews
                                    </Button>
                                </Box>

                                <Stack spacing={2}>
                                    <Button 
                                        variant="contained" 
                                        fullWidth 
                                        size="large"
                                        onClick={() => navigate(`/book/${vehicle._id}`)}
                                        startIcon={<Calendar size={20} />}
                                        sx={{ py: 1.5, fontWeight: 'bold' }}
                                    >
                                        Book Vehicle Now
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        fullWidth 
                                        size="large"
                                        startIcon={<Navigation size={20} />}
                                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${vehicle.location.coordinates[1]},${vehicle.location.coordinates[0]}`, '_blank')}
                                        sx={{ py: 1.5, fontWeight: 'bold' }}
                                    >
                                        Get Directions
                                    </Button>
                                </Stack>
                            </Box>
                        ) : (
                            <Typography color="text.secondary">Vendor information not available.</Typography>
                        )}
                    </Card>
                </Grid>
            </Grid>

            <VendorProfileModal 
                open={vendorModal} 
                onClose={() => setVendorModal(false)} 
                vendorUserId={vehicle.vendorId._id || vehicle.vendorId} 
            />
        </Container>
    );
};

export default VehicleDetail;
