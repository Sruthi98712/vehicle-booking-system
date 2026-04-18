import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Paper, TextField, Button, Grid,
    Avatar, CircularProgress, Divider, Card, CardContent,
    Tooltip, IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Phone, MapPin, Calendar, 
    Camera, Save, Map as MapIcon, Navigation,
    CheckCircle, ShieldCheck
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import RatingDisplay from '../components/RatingDisplay';
import api from '../api';
import { toast } from 'react-toastify';

const ProfileCard = ({ user }) => (
    <Card sx={{ 
        borderRadius: 6, 
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
        height: '100%'
    }}>
        <Box sx={{ 
            height: 140, 
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%)',
            position: 'relative'
        }}>
            <Box sx={{ 
                position: 'absolute', 
                bottom: -60, 
                left: '50%', 
                transform: 'translateX(-50%)',
                p: 1.5,
                bgcolor: 'white',
                borderRadius: '50%',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
                <Avatar sx={{ 
                    width: 100, 
                    height: 100, 
                    bgcolor: '#3b82f6', 
                    fontSize: 40,
                    fontWeight: 900,
                    border: '4px solid white'
                }}>
                    {user.name.charAt(0)}
                </Avatar>
            </Box>
        </Box>
        
        <CardContent sx={{ pt: 10, px: 4, pb: 4, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 950, letterSpacing: -1, color: '#0f172a', mb: 0.5 }}>
                {user.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Typography variant="body2" sx={{ 
                    fontWeight: 800, 
                    color: 'primary.main', 
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    letterSpacing: 1,
                    bgcolor: 'primary.lighter',
                    px: 1, py: 0.5, borderRadius: 1
                }}>
                    {user.role}
                </Typography>
                {user.role === 'vendor' && <ShieldCheck size={16} color="#3b82f6" />}
            </Box>

            {user.averageRating > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <RatingDisplay rating={user.averageRating} totalRatings={user.totalRatings} />
                </Box>
            )}

            <Divider sx={{ my: 3, opacity: 0.5 }} />
            
            <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <InfoRow icon={<Mail size={18} />} label="Email" value={user.email} />
                <InfoRow icon={<Phone size={18} />} label="Phone/Mobile" value={user.phone || user.mobile || 'Not provided'} />
                <InfoRow 
                    icon={<MapPin size={18} />} 
                    label="Location" 
                    value={[user.city, user.state].filter(Boolean).join(', ') || 'Global'} 
                />
                <InfoRow 
                    icon={<Calendar size={18} />} 
                    label="Joined" 
                    value={new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} 
                />
            </Box>
        </CardContent>
    </Card>
);

const InfoRow = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
        <Box>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                {value}
            </Typography>
        </Box>
    </Box>
);

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
    const autocompleteRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        city: '',
        state: '',
        country: '',
        latitude: '',
        longitude: '',
        addressLine: ''
    });

    const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: "YOUR_API_KEY_HERE" });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/v1/user/profile');
                const userData = res.data.data;
                setUser(userData);
                setFormData({
                    name: userData.name,
                    phone: userData.phone || '',
                    mobile: userData.mobile || '',
                    city: userData.city || '',
                    state: userData.state || '',
                    country: userData.country || '',
                    latitude: userData.vendorProfile?.location?.latitude || '',
                    longitude: userData.vendorProfile?.location?.longitude || '',
                    addressLine: userData.vendorProfile?.location?.address || ''
                });
            } catch (err) {
                toast.error('Error fetching profile details');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const res = await api.put('/v1/user/profile', formData);
            const updatedUser = res.data.data;
            setUser(updatedUser);
            const localUser = JSON.parse(localStorage.getItem('user'));
            localStorage.setItem('user', JSON.stringify({ ...localUser, name: updatedUser.name }));
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error updating profile');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (!user) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Box sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 2, md: 4 } }}>
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h3" sx={{ fontWeight: 950, letterSpacing: '-0.05em', color: '#0f172a' }}>
                        Profile <span style={{ color: '#3b82f6' }}>Settings.</span>
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Manage your personal information and preferences.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <ProfileCard user={user} />
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Paper sx={{ 
                            p: { xs: 3, md: 5 }, 
                            borderRadius: 6, 
                            border: '1px solid rgba(0,0,0,0.05)',
                            background: 'rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                                <Box sx={{ p: 1, bgcolor: 'primary.lighter', borderRadius: 2, color: 'primary.main', display: 'flex' }}>
                                    <User size={20} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 900 }}>Edit Personal Details</Typography>
                            </Box>

                            <Box component="form" onSubmit={handleSubmit}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Full Name"
                                            name="name"
                                            fullWidth
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            InputProps={{
                                                sx: { borderRadius: 3, fontWeight: 700 }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Email Address"
                                            fullWidth
                                            disabled
                                            value={user.email}
                                            helperText="Account email cannot be modified"
                                            InputProps={{
                                                sx: { borderRadius: 3, bgcolor: '#f1f5f9', fontWeight: 600 }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Phone Number"
                                            name="phone"
                                            fullWidth
                                            value={formData.phone}
                                            onChange={handleChange}
                                            InputProps={{
                                                sx: { borderRadius: 3, fontWeight: 700 }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="City"
                                            name="city"
                                            fullWidth
                                            value={formData.city}
                                            onChange={handleChange}
                                            InputProps={{
                                                sx: { borderRadius: 3, fontWeight: 700 }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="State"
                                            name="state"
                                            fullWidth
                                            value={formData.state}
                                            onChange={handleChange}
                                            InputProps={{
                                                sx: { borderRadius: 3, fontWeight: 700 }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Country"
                                            name="country"
                                            fullWidth
                                            value={formData.country}
                                            onChange={handleChange}
                                            InputProps={{
                                                sx: { borderRadius: 3, fontWeight: 700 }
                                            }}
                                        />
                                    </Grid>

                                    {user.role === 'vendor' && (
                                        <Grid item xs={12}>
                                            <Divider sx={{ my: 4 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2 }}>
                                                    <MapIcon size={16} />
                                                    <Typography variant="overline" sx={{ fontWeight: 900, color: 'primary.main' }}>
                                                        Business Location Settings
                                                    </Typography>
                                                </Box>
                                            </Divider>
                                            <Box sx={{ p: 4, bgcolor: '#f8fafc', borderRadius: 5, border: '1px dashed #cbd5e1' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Navigation size={16} color="#3b82f6" /> Map Configuration
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" paragraph>
                                                    Set your business coordinates to help customers find your vehicles on the map.
                                                </Typography>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}>
                                                        <TextField 
                                                            label="Latitude" 
                                                            name="latitude" 
                                                            value={formData.latitude} 
                                                            onChange={handleChange} 
                                                            fullWidth 
                                                            size="small"
                                                            InputProps={{ sx: { borderRadius: 2, bgcolor: 'white' }}}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField 
                                                            label="Longitude" 
                                                            name="longitude" 
                                                            value={formData.longitude} 
                                                            onChange={handleChange} 
                                                            fullWidth 
                                                            size="small"
                                                            InputProps={{ sx: { borderRadius: 2, bgcolor: 'white' }}}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Grid>
                                    )}

                                    <Grid item xs={12} sx={{ mt: 2 }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            disabled={updating}
                                            startIcon={updating ? <CircularProgress size={20} /> : <Save size={20} />}
                                            sx={{ 
                                                borderRadius: 4, 
                                                px: 6, 
                                                py: 2, 
                                                fontWeight: 900,
                                                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)',
                                                textTransform: 'none',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            {updating ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </motion.div>
    );
}
