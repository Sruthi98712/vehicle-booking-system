import React, { useState, useEffect } from 'react';
import { Container, Grid, Box, Typography, CircularProgress } from '@mui/material';
import { Heart, MapPin, Tag, Star, ArrowRight, Car, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

const SavedVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchSavedVehicles = async () => {
        setLoading(true);
        try {
            const res = await api.get('/v1/user/profile');
            if (res.data.success) {
                setVehicles(res.data.data.savedVehicles || []);
            }
        } catch (err) {
            toast.error('Error fetching favorites');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedVehicles();
    }, []);

    const handleToggleSave = async (vehicleId) => {
        try {
            const res = await api.post(`/v1/user/toggle-save/${vehicleId}`);
            if (res.data.success) {
                // Since we're on the saved vehicles page, we should remove it from the list if it was unsaved
                setVehicles(vehicles.filter(v => (v._id || v.vehicleId) !== vehicleId));
                toast.success('Removed from favorites');
            }
        } catch (err) {
            toast.error('Error updating favorites');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 6 }}>
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-12"
            >
                <div className="flex items-center gap-4 mb-4">
                    <span className="px-4 py-1.5 bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Heart size={12} fill="white" /> Favorites
                    </span>
                </div>
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase mb-4">
                    My Wishlist
                </h1>
                <p className="text-xl text-slate-500 font-medium max-w-2xl">
                    Vehicles you've saved for later. Ready when you are.
                </p>
            </motion.div>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
                    <CircularProgress sx={{ color: 'black' }} />
                </Box>
            ) : vehicles.length > 0 ? (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Grid container spacing={4}>
                        {vehicles.map((v) => (
                            <Grid item key={v._id} xs={12} sm={6} lg={4} xl={3}>
                                <motion.div 
                                    variants={cardVariants}
                                    whileHover={{ y: -10 }}
                                    className="bg-white rounded-[40px] overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-500 group"
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <img 
                                            src={v.images?.[0] || 'https://via.placeholder.com/600x400'} 
                                            alt={v.model}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-6 left-6 right-6 flex justify-between">
                                            <div className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-2xl shadow-sm text-[10px] font-black uppercase text-slate-900">
                                                {v.type}
                                            </div>
                                            <button 
                                                onClick={() => handleToggleSave(v._id)}
                                                className="p-3 bg-red-500 text-white rounded-2xl shadow-lg hover:shadow-red-500/20 transition-all"
                                            >
                                                <Heart size={18} fill="currentColor" />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-6 left-6">
                                            <Typography className="text-white text-3xl font-black drop-shadow-lg leading-tight">
                                                ₹{v.rentalPricePerDay}
                                                <span className="text-xs font-bold block uppercase opacity-80 tracking-widest">/ day</span>
                                            </Typography>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4 group-hover:text-blue-600 transition-colors">
                                            {v.make} {v.model}
                                        </h3>
                                        
                                        <div className="flex flex-wrap gap-4 mb-8">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-slate-400" />
                                                <span className="text-[10px] font-black uppercase text-slate-400">{v.city}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                                <span className="text-[10px] font-black text-slate-900">{v.averageRating?.toFixed(1) || '0.0'}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => navigate(`/book/${v._id}`)}
                                                className="flex-1 bg-slate-950 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg"
                                            >
                                                Book Now
                                            </button>
                                            <button 
                                                onClick={() => navigate(`/vehicle/${v._id}`)}
                                                className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-900 hover:text-white transition-all"
                                            >
                                                <ArrowRight size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </motion.div>
            ) : (
                <div className="bg-white border-2 border-dashed border-slate-200 p-20 rounded-[64px] text-center">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Heart size={40} className="text-red-200" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Your Wishlist is Empty</h2>
                    <p className="text-slate-500 font-medium max-w-md mx-auto mb-10">
                        Explore our fleet and save your favorite vehicles to view them here later.
                    </p>
                    <button 
                        onClick={() => navigate('/vehicles')}
                        className="bg-slate-950 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase hover:bg-blue-600 transition-all shadow-xl"
                    >
                        Browse Vehicles <ArrowRight size={18} className="inline ml-2" />
                    </button>
                </div>
            )}
        </Container>
    );
};

export default SavedVehicles;
