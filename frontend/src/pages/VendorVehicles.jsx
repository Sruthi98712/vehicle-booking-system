import React, { useState, useEffect } from 'react';
import { 
    Filter, 
    Search, 
    Grid as GridIcon, 
    List as ListIcon, 
    MoreHorizontal, 
    Star, 
    MapPin,
    AlertCircle,
    ChevronRight,
    Loader2,
    Trash2,
    Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

const VendorVehicles = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        fuelType: 'all',
        transmission: 'all',
        sortBy: 'newest'
    });

    useEffect(() => {
        const fetchVehicles = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/v1/vendor/vehicles`, { params: { type } });
                setVehicles(res.data.data);
            } catch (err) {
                toast.error('Error fetching vehicles');
            } finally {
                setLoading(false);
            }
        };
        fetchVehicles();
    }, [type]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this vehicle?')) return;
        try {
            await api.delete(`/v1/vehicles/${id}`);
            setVehicles(vehicles.filter(v => v._id !== id));
            toast.success('Vehicle removed');
        } catch (err) {
            toast.error('Error deleting vehicle');
        }
    };

    const toggleAvailability = async (vehicle) => {
        try {
            const res = await api.put(`/v1/vehicles/${vehicle._id}`, { available: !vehicle.available });
            setVehicles(vehicles.map(v => v._id === vehicle._id ? res.data.data : v));
            toast.success('Status updated');
        } catch (err) {
            toast.error('Error updating status');
        }
    };

    const filteredVehicles = vehicles
        .filter(v => {
            const matchesSearch = `${v.make} ${v.model}`.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filters.status === 'all' || 
                (filters.status === 'available' && v.available) || 
                (filters.status === 'maintenance' && !v.available);
            const matchesFuel = filters.fuelType === 'all' || v.fuelType === filters.fuelType;
            const matchesTransmission = filters.transmission === 'all' || v.transmission === filters.transmission;
            
            return matchesSearch && matchesStatus && matchesFuel && matchesTransmission;
        })
        .sort((a, b) => {
            if (filters.sortBy === 'price-low') return a.rentalPricePerDay - b.rentalPricePerDay;
            if (filters.sortBy === 'price-high') return b.rentalPricePerDay - a.rentalPricePerDay;
            if (filters.sortBy === 'rating') return (b.averageRating || 0) - (a.averageRating || 0);
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                        {type ? `${type}s` : 'All Vehicles'}
                    </h1>
                    <p className="text-slate-500 font-medium">Manage your fleet inventory and availability.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search model..."
                            className="bg-white border-slate-200 border px-10 py-3 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 outline-none w-64 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-3 rounded-2xl border transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${showFilters ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 shadow-sm'}`}
                    >
                        <Filter size={18} />
                        Filters
                    </button>
                    <div className="bg-white border border-slate-200 p-1 rounded-2xl flex shadow-sm">
                        <button 
                            onClick={() => setView('grid')}
                            className={`p-2 rounded-xl transition-all ${view === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <GridIcon size={20} />
                        </button>
                        <button 
                            onClick={() => setView('list')}
                            className={`p-2 rounded-xl transition-all ${view === 'list' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <ListIcon size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white border border-slate-200 rounded-[32px] p-8 grid grid-cols-1 md:grid-cols-4 gap-8 shadow-xl shadow-slate-200/50">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Availability</label>
                                <select 
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none appearance-none cursor-pointer"
                                    value={filters.status}
                                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                                >
                                    <option value="all">All Status</option>
                                    <option value="available">Available Only</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Fuel Type</label>
                                <select 
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none appearance-none cursor-pointer"
                                    value={filters.fuelType}
                                    onChange={(e) => setFilters({...filters, fuelType: e.target.value})}
                                >
                                    <option value="all">Any Fuel</option>
                                    <option value="Petrol">Petrol</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="Electric">Electric</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Transmission</label>
                                <select 
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none appearance-none cursor-pointer"
                                    value={filters.transmission}
                                    onChange={(e) => setFilters({...filters, transmission: e.target.value})}
                                >
                                    <option value="all">Any Transmission</option>
                                    <option value="Manual">Manual</option>
                                    <option value="Automatic">Automatic</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Sort By</label>
                                <select 
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none appearance-none cursor-pointer"
                                    value={filters.sortBy}
                                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Highest Rated</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="animate-spin text-slate-400" size={40} />
                </div>
            ) : filteredVehicles.length > 0 ? (
                <AnimatePresence mode="popLayout">
                    {view === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredVehicles.map((v) => (
                                <motion.div 
                                    layout
                                    key={v._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-200 group"
                                >
                                    <div className="relative h-48">
                                        <img src={v.images[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8'} alt={v.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-900">
                                                {v.type}
                                            </span>
                                        </div>
                                        <div className="absolute top-4 right-4">
                                            <button 
                                                onClick={() => toggleAvailability(v)}
                                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${v.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                                            >
                                                {v.available ? 'AVAILABLE' : 'MAINTENANCE'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{v.make} {v.model}</h3>
                                                <div className="flex items-center gap-2 text-slate-400 mt-1">
                                                    <MapPin size={14} />
                                                    <span className="text-xs font-bold">{v.city}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-blue-600 block">₹{v.rentalPricePerDay}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase">per day</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 py-4 border-t border-slate-100 mb-6">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-400 uppercase">Rating</span>
                                                <div className="flex items-center gap-1 text-slate-900 font-black">
                                                    <Star size={12} className="fill-yellow-500 text-yellow-500" />
                                                    {v.averageRating?.toFixed(1) || '0.0'}
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-400 uppercase">Trips</span>
                                                <span className="text-sm font-black text-slate-900">{v.totalTrips || 0}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => navigate(`/vendor/vehicles/edit/${v._id}`)}
                                                className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(v._id)}
                                                className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Earnings</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredVehicles.map((v) => (
                                        <tr key={v._id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <img src={v.images[0]} className="w-12 h-12 rounded-xl object-cover" alt="" />
                                                    <div>
                                                        <span className="font-black text-slate-900 block">{v.make} {v.model}</span>
                                                        <span className="text-[10px] font-bold text-slate-400">{v.licensePlate}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded-md">{v.type}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-black text-slate-900">₹{v.rentalPricePerDay}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => toggleAvailability(v)}
                                                    className={`w-32 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${v.available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                                >
                                                    {v.available ? 'Available' : 'Maintenance'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 font-black">₹{v.totalTrips * v.rentalPricePerDay || 0}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => {
                                                        const vid = v._id || v.id;
                                                        if (vid) navigate(`/vendor/vehicle/${vid}/customers`);
                                                    }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-all"><ChevronRight size={18}/></button>
                                                    <button onClick={() => navigate(`/vendor/vehicles/edit/${v._id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={18}/></button>
                                                    <button onClick={() => handleDelete(v._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AnimatePresence>
            ) : (
                <div className="bg-white p-16 rounded-[48px] text-center border-2 border-dashed border-slate-200">
                    <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="text-slate-300" size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase mb-2">No vehicles found</h2>
                    <p className="text-slate-500 font-medium mb-8">Start by adding your first vehicle to the marketplace.</p>
                    <button 
                        onClick={() => navigate('/vendor/vehicles/add')}
                        className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-600 transition-all"
                    >
                        ADD NEW VEHICLE
                    </button>
                </div>
            )}
        </div>
    );
};

export default VendorVehicles;
