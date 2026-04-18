import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search,
    MapPin,
    Car,
    ShieldCheck,
    Zap,
    UserCircle,
    PhoneCall,
    ArrowRight,
    Star
} from 'lucide-react';
import api from '../api';

const FEATURED_VEHICLES = [
    { id: 1, name: 'Tesla Model 3', category: 'Luxury Sedan', price: 85, rating: 4.9, vendor: 'Elite Motors', color: 'bg-slate-100' },
    { id: 2, name: 'BMW M4', category: 'Sport Coupe', price: 120, rating: 4.8, vendor: 'Premium Drive', color: 'bg-blue-50' },
    { id: 3, name: 'Range Rover Sport', category: 'Premium SUV', price: 150, rating: 5.0, vendor: 'Luxury Rentals', color: 'bg-zinc-100' },
];

const CATEGORIES = [
    { name: 'Cars', icon: '🚗', count: 120, color: 'from-blue-500 to-indigo-600' },
    { name: 'Bikes', icon: '🏍', count: 80, color: 'from-orange-400 to-red-500' },
    { name: 'Autos', icon: '🛺', count: 45, color: 'from-green-400 to-emerald-600' },
    { name: 'Vans', icon: '🚐', count: 30, color: 'from-purple-500 to-pink-500' },
    { name: 'Trucks', icon: '🚚', count: 25, color: 'from-slate-600 to-slate-800' },
    { name: 'Tractors', icon: '🚜', count: 15, color: 'from-yellow-400 to-amber-600' },
    { name: 'Buses', icon: '🚌', count: 12, color: 'from-red-500 to-rose-700' },
    { name: 'Cycles', icon: '🚲', count: 50, color: 'from-cyan-400 to-blue-500' },
];

const TESTIMONIALS = [
    { name: 'Arjun S.', rating: 5, text: '“Easy booking and great vehicle condition. Highly recommended!”' },
    { name: 'Sneha K.', rating: 5, text: '“The vendor was very professional. The map feature helped me find a bike in minutes.”' },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [searchLocation, setSearchLocation] = useState('');
    const [featuredVehicles, setFeaturedVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                // Fetch vehicles and sort by rating or just take the first 3
                const res = await api.get('/v1/vehicles');
                const vehicles = res.data.data || [];
                setFeaturedVehicles(vehicles.slice(0, 3));
            } catch (err) {
                console.error('Error fetching featured vehicles:', err);
                // Fallback to static if API fails
                setFeaturedVehicles([
                    { _id: 1, make: 'Tesla', model: 'Model 3', type: 'Luxury Sedan', rentalPricePerDay: 85, rating: 4.9, vendorId: { name: 'Elite Motors' }, images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf'] },
                    { _id: 2, make: 'BMW', model: 'M4', type: 'Sport Coupe', rentalPricePerDay: 120, rating: 4.8, vendorId: { name: 'Premium Drive' }, images: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888'] },
                    { _id: 3, make: 'Range Rover', model: 'Sport', type: 'Premium SUV', rentalPricePerDay: 150, rating: 5.0, vendorId: { name: 'Luxury Rentals' }, images: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d'] },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchVehicles();
    }, []);

    const handleGetStarted = () => {
        if (!user || !user.token) {
            navigate('/login');
        } else {
            const dashboardPath =
                user.role === 'admin' ? '/admin-dashboard' :
                    user.role === 'vendor' ? '/vendor-dashboard' :
                        '/customer-dashboard';
            navigate(dashboardPath);
        }
    };

    return (
        <div className="bg-slate-950 min-h-screen font-sans selection:bg-blue-500/30 selection:text-white">
            {/* 1. HERO SECTION */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950">
                <div className="absolute inset-0 opacity-40">
                    <img
                        src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1920&auto=format&fit=crop"
                        alt="Hero Background"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <Container className="relative z-10 px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="mb-8 inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-xl px-5 py-2 rounded-full text-blue-400 font-bold text-xs tracking-[0.2em] border border-blue-500/20 uppercase">
                            <Zap size={14} /> The Future of Rentals
                        </div>
                        <h1 className="text-6xl md:text-[120px] font-black text-white mb-8 tracking-tighter leading-[0.85]">
                            Rent Any Vehicle <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                                Near You
                            </span>
                        </h1>
                        <p className="text-xl text-slate-400 mb-14 max-w-2xl mx-auto font-medium leading-relaxed">
                            Discover premium vehicles from trusted local vendors.
                            Cars, bikes, and specialized machinery, all in one place.
                        </p>

                        {/* Search Bar */}
                        <div className="bg-white/5 backdrop-blur-2xl p-2 rounded-[2.5rem] md:rounded-full shadow-2xl max-w-5xl mx-auto flex flex-col md:flex-row gap-2 border border-white/10">
                            <div className="flex-[1.2] flex items-center px-8 gap-4 py-4 md:py-0">
                                <MapPin className="text-blue-500" size={20} />
                                <div className="text-left flex-1">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Location</label>
                                    <input
                                        type="text"
                                        placeholder="Enter city or address..."
                                        className="w-full bg-transparent outline-none text-white font-bold text-sm placeholder:text-slate-600"
                                        value={searchLocation}
                                        onChange={(e) => setSearchLocation(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 flex items-center px-8 gap-4 border-l border-white/10 py-4 md:py-0">
                                <Car className="text-blue-500" size={20} />
                                <div className="text-left flex-1">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Category</label>
                                    <select className="w-full bg-transparent outline-none text-white font-bold text-sm appearance-none cursor-pointer">
                                        <option className="bg-slate-900">All Categories</option>
                                        <option className="bg-slate-900">Cars</option>
                                        <option className="bg-slate-900">Bikes</option>
                                        <option className="bg-slate-900">Luxury</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/browse-vehicles?location=${encodeURIComponent(searchLocation)}`)}
                                className="bg-blue-600 hover:bg-white text-white hover:text-blue-600 px-12 py-5 rounded-[2rem] md:rounded-full font-black transition-all flex items-center justify-center gap-3 group active:scale-95 shadow-2xl shadow-blue-600/20"
                            >
                                START SEARCH <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </motion.div>
                </Container>
            </section>

            {/* 2. CATEGORIES SECTION (DARK GRADIENT BOXES) */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl font-black text-white mb-6 tracking-tighter">Explore Categories</h2>
                        <p className="text-slate-400 font-medium max-w-lg mx-auto">Selection of specialized vehicles curated for every possible need.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {CATEGORIES.map((cat, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -5 }}
                                className="relative group p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-800/50 overflow-hidden cursor-pointer backdrop-blur-xl transition-all hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10"
                                onClick={() => navigate('/browse-vehicles')}
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                    {cat.icon}
                                </div>
                                <h3 className="text-2xl font-black text-white mb-1">{cat.name}</h3>
                                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">{cat.count} AVAILABLE</p>
                                <ArrowRight className="absolute top-8 right-8 text-slate-700 group-hover:text-blue-500 transition-colors" size={24} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. FEATURED VEHICLES (DARK THEME) */}
            <section className="py-32 px-6 bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
                        <div className="text-left">
                            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">Premier Fleet</h2>
                            <p className="text-slate-400 font-medium">Top-rated vehicles from our most trusted vendors.</p>
                        </div>
                        <button onClick={() => navigate('/vehicles')} className="group flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black transition-all hover:bg-white hover:text-blue-600">
                            VIEW FULL FLEET <ArrowRight size={18} className="group-hover:translate-x-1" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {featuredVehicles.map((v) => (
                            <motion.div
                                key={v._id || v.id}
                                whileHover={{ y: -8 }}
                                className="bg-gradient-to-br from-slate-800 to-slate-900 p-10 rounded-[3rem] border border-slate-700/50 flex flex-col h-full shadow-sm hover:shadow-2xl hover:border-blue-500/30 transition-all backdrop-blur-xl"
                                onClick={() => navigate(`/vehicle/${v._id}`)}
                            >
                                <div className="flex justify-between items-start mb-10">
                                    <div className="bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                                        {v.type || v.category}
                                    </div>
                                    <div className="flex items-center gap-1.5 font-black text-white">
                                        <Star size={16} className="fill-yellow-400 text-yellow-400" /> {v.rating || 5.0}
                                    </div>
                                </div>

                                <div className="mb-6 aspect-video overflow-hidden rounded-2xl">
                                    <img 
                                        src={v.images?.[0] || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d'} 
                                        alt={v.make}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                <h3 className="text-3xl font-black text-white mb-2 leading-none">{v.make} {v.model}</h3>
                                <p className="text-slate-400 font-bold mb-auto tracking-tight">by {v.vendorId?.name || 'Trusted Vendor'}</p>

                                <div className="mt-12 py-8 border-t border-slate-800">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-4xl font-black text-white">₹{v.rentalPricePerDay || v.price}</span>
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">/ DAY</span>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white cursor-pointer hover:bg-white hover:text-blue-600 transition-colors">
                                            <ArrowRight size={24} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. HOW IT WORKS (NO IMAGES) */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-5xl font-black text-white mb-24 tracking-tighter">Seamless Experience</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        {[
                            { icon: <Search className="text-blue-400" />, title: 'Find', desc: 'Browse curated listings near you' },
                            { icon: <Zap className="text-amber-400" />, title: 'Book', desc: 'Confirm dates with zero friction' },
                            { icon: <PhoneCall className="text-green-400" />, title: 'Connect', desc: 'Coordinate with verified vendors' },
                            { icon: <Car className="text-white" />, title: 'Ride', desc: 'Start your journey premium style' }
                        ].map((s, i) => (
                            <div key={i} className="group flex flex-col items-center">
                                <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center mb-10 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all group-hover:scale-110 shadow-xl backdrop-blur-xl">
                                    {React.cloneElement(s.icon, { size: 32 })}
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3">{s.title}</h3>
                                <p className="text-slate-400 font-medium leading-relaxed max-w-[200px]">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. GEOSPATIAL SEARCH (NO IMAGES) */}
            <section className="py-32 px-6 bg-slate-950 relative overflow-hidden">
                {/* Abstract decorative background */}
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 border-dashed border-white/20 rounded-full animate-spin-slow" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full" />
                </div>

                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10 text-center md:text-left">
                    <div className="flex-1">
                        <div className="mb-6 inline-flex items-center gap-2 bg-blue-500/20 px-4 py-1.5 rounded-full text-blue-400 font-black text-[10px] tracking-widest uppercase">
                            <MapPin size={12} /> Visual Discovery
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none">Radius Based <br />Map Search</h2>
                        <p className="text-lg text-slate-400 mb-12 max-w-xl font-medium leading-relaxed">
                            Stop guessing distances. Use our advanced geospatial interface to see exactly which vehicles are closest to your doorstep.
                        </p>
                        <ul className="space-y-4 mb-14 text-left inline-block">
                            {['Real-time vendor markers', 'Radius limit slider', 'Instant directions integration'].map((feat, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-300 font-bold">
                                    <ShieldCheck className="text-blue-500" size={20} /> {feat}
                                </li>
                            ))}
                        </ul>
                        <div>
                            <button onClick={() => navigate('/map-vehicles')} className="bg-white text-slate-950 px-10 py-5 rounded-[2rem] font-black transition-all hover:bg-blue-600 hover:text-white shadow-2xl active:scale-95">
                                LAUNCH INTERACTIVE MAP
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 relative group">
                        {/* Styled "No Image" Map Placeholder */}
                        <div className="w-full aspect-square bg-white/5 backdrop-blur-3xl rounded-[4rem] border border-white/10 p-12 flex flex-col items-center justify-center text-center">
                            <div className="w-32 h-32 bg-blue-500/20 rounded-[2.5rem] flex items-center justify-center text-blue-500 mb-8 border border-blue-500/20 animate-pulse">
                                <MapPin size={64} />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Geospatial UI</h3>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Vantage Dynamic Discovery</p>

                            {/* Decorative floating points */}
                            <div className="absolute top-20 right-20 w-4 h-4 bg-green-500 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.6)]" />
                            <div className="absolute bottom-40 left-20 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)]" />
                            <div className="absolute top-40 left-40 w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.6)]" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. VENDOR PROMO (NO IMAGES) */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto rounded-[4rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-16 md:p-32 text-center relative overflow-hidden shadow-2xl shadow-blue-500/20">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9]">Start Earning <br />with Your Fleet</h2>
                        <p className="text-xl text-blue-100 mb-14 font-medium leading-relaxed">
                            Join the fastest growing vehicle rental network.
                            Set your own prices, manage schedules, and get paid directly.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button onClick={() => navigate('/register')} className="bg-white text-blue-600 px-12 py-5 rounded-[2rem] font-black transition-all hover:bg-slate-950 hover:text-white shadow-xl active:scale-95">
                                BECOME A VENDOR
                            </button>
                            <button className="bg-blue-700/50 backdrop-blur-md text-white border border-blue-400/30 px-12 py-5 rounded-[2rem] font-black transition-all hover:bg-blue-800">
                                LEARN MORE
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. TESTIMONIALS (DARK THEME BOXES) */}
            <section className="py-32 px-6 bg-slate-950">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl font-black text-white mb-4 tracking-tighter leading-none">Verified Reviews</h2>
                        <p className="text-slate-300 font-medium">Real experiences from our global community.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {TESTIMONIALS.map((t, idx) => (
                            <div key={idx} className="bg-gradient-to-br from-slate-800 to-slate-900 p-12 rounded-[3.5rem] border border-slate-700/50 flex flex-col gap-10 hover:border-blue-500/30 transition-all backdrop-blur-xl group">
                                <p className="text-2xl font-bold text-slate-200 leading-relaxed italic">“{t.text.replace(/“|”/g, '')}”</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl group-hover:scale-110 transition-transform">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-black text-white">{t.name}</div>
                                            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Verified Customer</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. FOOTER */}
            <footer className="bg-slate-950 pt-32 pb-16 px-6 text-white relative">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-4xl font-black mb-8 tracking-tighter">RENTALX<span className="text-blue-500">.</span></h3>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-sm mb-10">
                            The intelligent platform for vehicle management and on-demand rentals.
                            Empowering vendors and travelers since 2024.
                        </p>
                        <div className="flex gap-3">
                            {['Twitter', 'Instagram', 'LinkedIn'].map(social => (
                                <div key={social} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all cursor-pointer border border-white/10">
                                    <Star size={20} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] mb-10">Discover</h4>
                        <ul className="space-y-4 text-white font-bold text-sm">
                            <li><a href="#" className="hover:text-blue-500 transition-colors">Find a Car</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition-colors">Nearby Map</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition-colors">Vendor Pricing</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition-colors">Help Center</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] mb-10">Company</h4>
                        <ul className="space-y-4 text-white font-bold text-sm">
                            <li><button onClick={() => navigate('/vision')} className="hover:text-blue-500 transition-colors">Our Vision</button></li>
                            <li><button onClick={() => navigate('/contact')} className="hover:text-blue-500 transition-colors">Contact</button></li>
                            <li><button onClick={() => navigate('/privacy')} className="hover:text-blue-500 transition-colors">Privacy</button></li>
                            <li><button onClick={() => navigate('/legal')} className="hover:text-blue-500 transition-colors">Legal</button></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    <div>&copy; {new Date().getFullYear()} RENTALX PLATFORM. TRADEMARK REGISTERED.</div>
                    <div className="flex gap-10">
                        <span className="text-white">English (US)</span>
                        <span className="text-white">USD ($)</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function Container({ children, className = '' }) {
    return <div className={`max-w-7xl mx-auto ${className}`}>{children}</div>;
}
