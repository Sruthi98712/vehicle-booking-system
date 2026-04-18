import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    CircularProgress,
} from '@mui/material';
import { 
    Search, 
    MapPin, 
    Tag, 
    Star, 
    ArrowRight, 
    Car,
    SlidersHorizontal,
    Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const VehicleTypeListing = () => {
    const { vehicleType } = useParams();
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [savedVehicles, setSavedVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        location: '',
        priceMin: '',
        priceMax: '',
        rating: ''
    });

    const fetchSavedVehicles = async () => {
        try {
            const res = await api.get('/v1/user/profile');
            if (res.data.success) {
                setSavedVehicles(res.data.data.savedVehicles || []);
            }
        } catch (err) {
            console.error('Error fetching saved vehicles:', err);
        }
    };

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.location) params.append('location', filters.location);
            if (filters.priceMin) params.append('priceMin', filters.priceMin);
            if (filters.priceMax) params.append('priceMax', filters.priceMax);
            if (filters.rating) params.append('rating', filters.rating);

            const response = await api.get(`/v1/vehicles/type/${vehicleType}?${params.toString()}`);
            if (response.data.success) {
                setVehicles(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const locationParam = queryParams.get('location');
        if (locationParam) setFilters(prev => ({ ...prev, location: locationParam }));
        fetchSavedVehicles();
    }, [vehicleType]);

    useEffect(() => {
        fetchVehicles();
    }, [vehicleType, filters.location, filters.priceMin, filters.priceMax, filters.rating]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleToggleSave = async (vehicleId) => {
        try {
            const res = await api.post(`/v1/user/toggle-save/${vehicleId}`);
            if (res.data.success) {
                setSavedVehicles(res.data.data);
                toast.success(savedVehicles.includes(vehicleId) ? 'Removed from favorites' : 'Saved to favorites');
            }
        } catch (err) {
            toast.error('Error updating favorites');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 6 }}>
            {/* Header Section */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-12"
            >
                <div className="flex items-center gap-4 mb-4">
                    <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                        Marketplace
                    </span>
                </div>
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase mb-4">
                    Available {vehicleType}s
                </h1>
                <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                    Premium fleet of {vehicleType}s tailored for your comfort and style. 
                    Transparent pricing, vetted vendors, and instant booking.
                </p>
            </motion.div>

            {/* Premium Filter Bar */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[32px] mb-12 shadow-2xl shadow-slate-200/50 flex flex-wrap lg:flex-nowrap items-center gap-6"
            >
                <div className="flex-1 min-w-[200px] relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={18} />
                    <input 
                        name="location"
                        placeholder="Location"
                        className="w-full bg-slate-50 border-none rounded-2xl px-12 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                        value={filters.location}
                        onChange={handleFilterChange}
                    />
                </div>
                
                <div className="flex-1 min-w-[300px] flex gap-4">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Min</span>
                        <input 
                            name="priceMin"
                            type="number"
                            placeholder="₹"
                            className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-700 outline-none"
                            value={filters.priceMin}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Max</span>
                        <input 
                            name="priceMax"
                            type="number"
                            placeholder="₹"
                            className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-700 outline-none"
                            value={filters.priceMax}
                            onChange={handleFilterChange}
                        />
                    </div>
                </div>

                <div className="min-w-[180px]">
                    <select 
                        name="rating"
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none appearance-none cursor-pointer"
                        value={filters.rating}
                        onChange={handleFilterChange}
                    >
                        <option value="">Any Rating</option>
                        <option value="4">4+ Stars</option>
                        <option value="3">3+ Stars</option>
                        <option value="2">2+ Stars</option>
                    </select>
                </div>

                <button 
                    onClick={fetchVehicles}
                    className="bg-slate-950 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3 shadow-xl shadow-slate-900/10"
                >
                    <SlidersHorizontal size={18} /> Filter
                </button>
            </motion.div>

            {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12, gap: 4 }}>
                    <div className="relative w-20 h-20">
                        <CircularProgress sx={{ color: 'black' }} size={80} thickness={2} />
                        <Car className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-900" size={32} />
                    </div>
                    <Typography className="font-black text-slate-400 uppercase tracking-widest text-[10px]">
                        Scanning the fleet...
                    </Typography>
                </Box>
            ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Grid container spacing={4}>
                        {vehicles.length > 0 ? (
                            vehicles.map((v) => (
                                <Grid item key={v.vehicleId} xs={12} sm={6} lg={4} xl={3}>
                                    <motion.div 
                                        variants={cardVariants}
                                        whileHover={{ y: -10 }}
                                        className="bg-white rounded-[40px] overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group"
                                    >
                                        {/* Image Section */}
                                        <div className="relative h-64 overflow-hidden">
                                            <img 
                                                src={v.images[0] || 'https://via.placeholder.com/600x400?text=No+Vehicle+Image'} 
                                                alt={v.vehicleName}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                                                <div className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-2xl shadow-sm text-[10px] font-black uppercase text-slate-900 flex items-center gap-2">
                                                    <Star size={12} className="fill-yellow-500 text-yellow-500" />
                                                    {v.vendor?.rating || '0.0'}
                                                </div>
                                                <button 
                                                    onClick={() => handleToggleSave(v.vehicleId)}
                                                    className={`p-3 backdrop-blur rounded-2xl transition-all shadow-sm ${savedVehicles.includes(v.vehicleId) ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-400 hover:text-red-500'}`}
                                                >
                                                    <Heart size={18} fill={savedVehicles.includes(v.vehicleId) ? 'currentColor' : 'none'} />
                                                </button>
                                            </div>
                                            <div className="absolute bottom-6 left-6">
                                                <Typography className="text-white text-3xl font-black drop-shadow-lg leading-tight">
                                                    ₹{v.pricePerDay}
                                                    <span className="text-xs font-bold block uppercase opacity-80 tracking-widest mt-0.5">/ per day</span>
                                                </Typography>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-8">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
                                                        {v.vehicleName}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-black text-white">
                                                            {v.vendor?.name?.charAt(0)}
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-500 leading-none">
                                                            {v.vendor?.name || 'Trusted Vendor'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <Car size={20} />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 py-4 border-t border-slate-100 mb-8">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} className="text-slate-400" />
                                                    <span className="text-[10px] font-black uppercase text-slate-400">
                                                        {v.vendor?.location || 'Vijayawada'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Tag size={14} className="text-slate-400" />
                                                    <span className="text-[10px] font-black uppercase text-slate-400">
                                                        Best Choice
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <button 
                                                    onClick={() => navigate(`/book/${v.vehicleId}`)}
                                                    className="flex-1 bg-slate-950 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-600/20"
                                                >
                                                    Instant Book
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/vehicle/${v.vehicleId}`)}
                                                    className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-900 hover:text-white transition-all group/btn"
                                                >
                                                    <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Grid>
                            ))
                        ) : (
                            <Grid item xs={12}>
                                <div className="bg-white border-2 border-dashed border-slate-200 p-20 rounded-[64px] text-center">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <Search size={40} className="text-slate-300" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">No {vehicleType}s Available</h2>
                                    <p className="text-slate-500 font-medium max-w-md mx-auto mb-10 leading-relaxed">
                                        We couldn't find any {vehicleType}s matching your current filters. 
                                        Try adjusting your search criteria or explore other categories.
                                    </p>
                                    <button 
                                        onClick={() => setFilters({ location: '', priceMin: '', priceMax: '', rating: '' })}
                                        className="inline-flex items-center gap-3 bg-slate-950 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10"
                                    >
                                        Clear All Filters <ArrowRight size={18} />
                                    </button>
                                </div>
                            </Grid>
                        )}
                    </Grid>
                </motion.div>
            )}
        </Container>
    );
};

export default VehicleTypeListing;
