import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    MapPin, 
    Navigation, 
    Star, 
    X, 
    ChevronRight, 
    Filter, 
    DollarSign,
    Car,
    User
} from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import VendorProfileModal from '../components/VendorProfileModal';

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const defaultCenter = {
    lat: 16.5062, // Vijayawada center
    lng: 80.6480,
};

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    styles: [
        {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#7c9bad" }]
        },
        // ... adding some premium dark map styles or just keeping it clean
    ]
};

const VEHICLE_TYPES = ['car', 'bike', 'auto', 'truck', 'tractor', 'bus', 'van', 'cycle'];

export default function MapVehicles() {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "" // Key should be handled via env in production
    });

    const navigate = useNavigate();
    const [map, setMap] = useState(null);
    const [center, setCenter] = useState(defaultCenter);
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [vendorModal, setVendorModal] = useState({ open: false, userId: null });
    const [radius, setRadius] = useState(10);
    const [loading, setLoading] = useState(false);
    
    // Filters
    const [filters, setFilters] = useState({
        type: '',
        priceMax: 10000,
        minRating: 0
    });

    const detectLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setCenter(loc);
                    fetchNearby(loc.lat, loc.lng);
                },
                () => fetchNearby(defaultCenter.lat, defaultCenter.lng)
            );
        } else {
            fetchNearby(defaultCenter.lat, defaultCenter.lng);
        }
    }, []);

    const fetchNearby = async (lat, lng) => {
        setLoading(true);
        try {
            const res = await api.get('/vehicles/nearby', {
                params: { latitude: lat, longitude: lng, radius }
            });
            setVehicles(res.data.data);
            setFilteredVehicles(res.data.data);
        } catch (err) {
            console.error('Error fetching vehicles:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        detectLocation();
    }, [radius]);

    // Client-side filtering
    useEffect(() => {
        const result = vehicles.filter(v => {
            const matchesType = !filters.type || v.vehicleType === filters.type;
            const matchesPrice = v.pricePerDay <= filters.priceMax;
            const matchesRating = v.vendor.rating >= filters.minRating;
            return matchesType && matchesPrice && matchesRating;
        });
        setFilteredVehicles(result);
    }, [filters, vehicles]);

    const onLoad = useCallback(m => setMap(m), []);
    const onUnmount = useCallback(() => setMap(null), []);

    if (!isLoaded) return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-900">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
            />
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-950 overflow-hidden font-sans text-slate-200">
            {/* Left Side: Vehicle List & Filters */}
            <div className="w-full md:w-[400px] flex flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl z-20">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-black tracking-tight text-white mb-2">Nearby Vehicles</h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Find your perfect ride instantly</p>
                </div>

                {/* Filters */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Search Radius ({radius} km)</label>
                        <input 
                            type="range" min="1" max="50" value={radius} 
                            onChange={(e) => setRadius(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vehicle Type</label>
                        <div className="grid grid-cols-4 gap-2">
                            {VEHICLE_TYPES.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilters(f => ({ ...f, type: f.type === type ? '' : type }))}
                                    className={`p-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${
                                        filters.type === type 
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Max Price</label>
                            <span className="text-xs font-bold text-blue-400">₹{filters.priceMax}</span>
                        </div>
                        <input 
                            type="range" min="100" max="10000" step="100" value={filters.priceMax} 
                            onChange={(e) => setFilters(f => ({ ...f, priceMax: parseInt(e.target.value) }))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    {/* Vehicle List Items */}
                    <div className="pt-4 space-y-4">
                        <div className="flex justify-between items-center bg-slate-800/30 p-3 rounded-2xl border border-slate-700/50">
                            <span className="text-xs font-bold text-slate-300">{filteredVehicles.length} vehicles found</span>
                            <button onClick={detectLocation} className="p-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl transition-colors">
                                <Navigation size={14} />
                            </button>
                        </div>

                        <AnimatePresence>
                            {filteredVehicles.map(v => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={v.vehicleId}
                                    onClick={() => {
                                        setCenter(v.location);
                                        setSelectedVehicle(v);
                                    }}
                                    className={`group relative p-4 rounded-3xl border transition-all cursor-pointer ${
                                        selectedVehicle?.vehicleId === v.vehicleId
                                        ? 'bg-blue-600/10 border-blue-500/50 ring-2 ring-blue-500/20'
                                        : 'bg-slate-800/30 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 rounded-2xl bg-slate-800 overflow-hidden flex-shrink-0">
                                            <img src={v.image} alt={v.vehicleName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-black text-white truncate">{v.vehicleName}</h3>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mt-0.5">
                                                <Car size={10} /> {v.vehicleType}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full text-[9px] font-black">
                                                    <Star size={10} className="fill-yellow-500" /> {v.vendor.rating.toFixed(1)}
                                                </div>
                                                <span className="text-sm font-black text-blue-400">₹{v.pricePerDay}</span>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setVendorModal({ open: true, userId: v.vendor.vendorId });
                                                    }}
                                                    className="p-1 hover:text-blue-500 transition-colors ml-auto"
                                                >
                                                    <User size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors self-center" />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredVehicles.length === 0 && !loading && (
                            <div className="text-center py-12 px-6">
                                <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-500">
                                    <Search size={32} />
                                </div>
                                <h4 className="text-white font-black mb-1">No vehicles found</h4>
                                <p className="text-xs text-slate-500">Try expanding your search radius or changing filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side: Map */}
            <div className="flex-1 relative">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={13}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    options={mapOptions}
                >
                    {/* User Marker */}
                    <Marker
                        position={center}
                        icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            fillColor: '#3b82f6',
                            fillOpacity: 0.2,
                            strokeWeight: 2,
                            strokeColor: '#3b82f6',
                            scale: 40,
                        }}
                    />
                    <Marker
                        position={center}
                        icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            fillColor: '#3b82f6',
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: '#ffffff',
                            scale: 8,
                        }}
                    />

                    {/* Vehicle Markers */}
                    {filteredVehicles.map(v => (
                        <Marker
                            key={v.vehicleId}
                            position={{ lat: v.location.latitude, lng: v.location.longitude }}
                            onClick={() => setSelectedVehicle(v)}
                            icon={{
                                url: `https://maps.google.com/mapfiles/ms/icons/${v.vehicleType === 'car' ? 'red' : 'green'}-dot.png`,
                            }}
                        />
                    ))}

                    <AnimatePresence>
                        {selectedVehicle && (
                            <InfoWindow
                                position={{ lat: selectedVehicle.location.latitude, lng: selectedVehicle.location.longitude }}
                                onCloseClick={() => setSelectedVehicle(null)}
                            >
                                <div className="p-1 min-w-[200px] text-slate-900 bg-white rounded-xl overflow-hidden shadow-2xl">
                                    <div className="h-24 bg-slate-100 rounded-lg overflow-hidden mb-3">
                                        <img src={selectedVehicle.image} alt={selectedVehicle.vehicleName} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="px-1 pb-2">
                                        <h3 className="font-black text-sm mb-0.5">{selectedVehicle.vehicleName}</h3>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-1">
                                                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                                <span className="text-[10px] font-black">{selectedVehicle.vendor.rating.toFixed(1)}</span>
                                            </div>
                                            <span className="font-black text-blue-600 text-sm">₹{selectedVehicle.pricePerDay}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => navigate(`/book/${selectedVehicle.vehicleId}`)}
                                                className="flex-1 bg-slate-950 text-white py-2 rounded-lg text-[10px] font-black hover:bg-blue-600 transition-colors"
                                            >
                                                BOOK
                                            </button>
                                            <button 
                                                onClick={() => setVendorModal({ open: true, userId: selectedVehicle.vendor.vendorId })}
                                                className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-[10px] font-black hover:bg-slate-200 transition-colors"
                                            >
                                                VENDOR
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </InfoWindow>
                        )}
                    </AnimatePresence>
                </GoogleMap>

                {/* Vendor Profile Modal */}
                <VendorProfileModal 
                    open={vendorModal.open} 
                    onClose={() => setVendorModal({ open: false, userId: null })} 
                    vendorUserId={vendorModal.userId} 
                />

                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] z-10 flex items-center justify-center pointer-events-none">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
