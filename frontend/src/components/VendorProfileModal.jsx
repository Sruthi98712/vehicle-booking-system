import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    Avatar,
    Rating,
    Divider,
    Stack,
    Button,
    IconButton,
    CircularProgress,
    Paper,
    Grid
} from '@mui/material';
import { 
    X, 
    Phone, 
    Mail, 
    MessageCircle, 
    MapPin, 
    Star, 
    Calendar,
    ArrowRight
} from 'lucide-react';
import api from '../api';

const VendorProfileModal = ({ open, onClose, vendorId, vendorUserId }) => {
    const [loading, setLoading] = useState(true);
    const [vendorData, setVendorData] = useState(null);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        if (open && (vendorId || vendorUserId)) {
            fetchVendorProfile();
        }
    }, [open, vendorId, vendorUserId]);

    const fetchVendorProfile = async () => {
        setLoading(true);
        try {
            // Using vendorUserId if available, otherwise would need a way to get user from vendorId
            // In our system, vendorUserId is usually what's stored in Vehicle.vendorId
            const targetId = vendorUserId || vendorId;
            
            // 1. Get User Reviews
            const reviewsRes = await api.get(`/v1/reviews/${targetId}`);
            setReviews(reviewsRes.data.reviews || []);

            // 2. Get Vendor Details (We use the Vehicle or User info typically)
            // Attempt to find the vendor profile specifically
            const vendorRes = await api.get(`/v1/vendors/profile/${targetId}`).catch(() => null);
            setVendorData(vendorRes?.data?.data || null);

        } catch (err) {
            console.error('Error fetching vendor profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = (phone) => {
        const cleanPhone = phone?.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: { 
                    borderRadius: 6,
                    maxHeight: '90vh',
                    bgcolor: 'slate.950',
                    color: 'white',
                    backgroundImage: 'none',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }
            }}
        >
            <IconButton
                onClick={onClose}
                sx={{ position: 'absolute', right: 20, top: 20, color: 'slate.400', zIndex: 1 }}
            >
                <X size={24} />
            </IconButton>

            <DialogContent sx={{ p: 0 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box>
                        {/* Header/Cover Area */}
                        <Box sx={{ 
                            h: 200, 
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'flex-end',
                            px: 4,
                            pb: 3
                        }}>
                            <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end', mb: -6 }}>
                                <Avatar 
                                    sx={{ width: 120, height: 120, border: '4px solid #0f172a', bgcolor: 'blue.600', fontSize: '2.5rem', fontWeight: 900 }}
                                >
                                    {vendorData?.businessName?.[0] || 'V'}
                                </Avatar>
                                <Box sx={{ pb: 6 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'white' }}>
                                        {vendorData?.businessName || 'Elite Rentals'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'yellow.500/10', color: 'yellow.500', px: 2, py: 0.5, borderRadius: 'full', fontSize: '0.8rem', fontWeight: 800 }}>
                                            <Star size={14} fill="currentColor" />
                                            {vendorData?.rating || '4.8'}
                                        </Box>
                                        <Typography variant="body2" sx={{ color: 'slate.400', fontWeight: 600 }}>
                                            {reviews.length} Verified Reviews
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        <Grid container sx={{ mt: 8, p: 4 }} spacing={4}>
                            {/* Left Side: Info and Actions */}
                            <Grid item xs={12} md={5}>
                                <Stack spacing={4}>
                                    <Box>
                                        <Typography variant="overline" sx={{ color: 'blue.500', fontWeight: 900, letterSpacing: 2 }}>About Vendor</Typography>
                                        <Typography variant="body2" sx={{ color: 'slate.300', mt: 1, lineHeight: 1.6 }}>
                                            {vendorData?.publicDescription || "Professional vehicle rental services with a focus on quality and customer satisfaction. Offering a wide range of well-maintained vehicles for all your needs."}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="overline" sx={{ color: 'blue.500', fontWeight: 900, letterSpacing: 2 }}>Contact Options</Typography>
                                        <Stack spacing={2} sx={{ mt: 2 }}>
                                            <Button 
                                                variant="contained" 
                                                fullWidth
                                                startIcon={<Phone size={18} />}
                                                sx={{ bgcolor: 'white', color: 'slate.950', '&:hover': { bgcolor: 'slate.100' }, py: 1.5, borderRadius: 3, fontWeight: 900 }}
                                                onClick={() => window.open(`tel:${vendorData?.businessPhone}`)}
                                            >
                                                Call Now
                                            </Button>
                                            <Button 
                                                variant="outlined" 
                                                fullWidth
                                                startIcon={<MessageCircle size={18} />}
                                                sx={{ borderColor: 'green.500', color: 'green.500', '&:hover': { bgcolor: 'green.500/10', borderColor: 'green.500' }, py: 1.5, borderRadius: 3, fontWeight: 900 }}
                                                onClick={() => handleWhatsApp(vendorData?.businessPhone)}
                                            >
                                                WhatsApp Chat
                                            </Button>
                                        </Stack>
                                    </Box>

                                    <Box>
                                        <Typography variant="overline" sx={{ color: 'blue.500', fontWeight: 900, letterSpacing: 2 }}>Business Location</Typography>
                                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                            <MapPin className="text-blue-500 flex-shrink-0" size={20} />
                                            <Typography variant="body2" sx={{ color: 'slate.300' }}>
                                                {vendorData?.address?.city}, {vendorData?.address?.state}<br/>
                                                {vendorData?.address?.zipCode}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Stack>
                            </Grid>

                            {/* Right Side: Reviews */}
                            <Grid item xs={12} md={7}>
                                <Box>
                                    <Typography variant="overline" sx={{ color: 'blue.500', fontWeight: 900, letterSpacing: 2 }}>Customer Reviews</Typography>
                                    <Stack spacing={3} sx={{ mt: 2 }}>
                                        {reviews.length > 0 ? reviews.map(review => (
                                            <Paper 
                                                key={review._id}
                                                sx={{ 
                                                    p: 3, 
                                                    bgcolor: 'slate.900/50', 
                                                    borderRadius: 4, 
                                                    border: '1px solid', 
                                                    borderColor: 'slate.800',
                                                    color: 'white'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                        <Avatar sx={{ bgcolor: 'slate.800', fontWeight: 800 }}>{review.reviewerId?.name?.[0]}</Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{review.reviewerId?.name}</Typography>
                                                            <Typography variant="caption" sx={{ color: 'slate.500' }}>{new Date(review.createdAt).toLocaleDateString()}</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Rating value={review.rating} readOnly size="small" />
                                                </Box>
                                                <Typography variant="body2" sx={{ color: 'slate.300', fontStyle: 'italic' }}>
                                                    "{review.comment}"
                                                </Typography>
                                            </Paper>
                                        )) : (
                                            <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'slate.900/30', borderRadius: 4 }}>
                                                <Star size={40} className="text-slate-800 mx-auto mb-3" />
                                                <Typography variant="body2" sx={{ color: 'slate.500' }}>No reviews yet for this vendor.</Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default VendorProfileModal;
