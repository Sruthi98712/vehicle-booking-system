import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    Car, 
    CalendarCheck, 
    Users, 
    TrendingUp, 
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Star,
    ChevronRight,
    Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm"
    >
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600`}>
                <Icon size={24} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'} text-xs font-black`}>
                    {trend > 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{title}</span>
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
    </motion.div>
);

const VendorDashboardNew = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/v1/vendor/stats');
                setStats(res.data.data);
            } catch (err) {
                toast.error('Error fetching dashboard stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-slate-400" size={48} />
        </div>
    );

    if (!stats) return (
        <div className="h-screen flex flex-col items-center justify-center text-slate-500">
            <TrendingUp size={48} className="mb-4 opacity-20" />
            <h2 className="text-xl font-black uppercase tracking-tight">No data available</h2>
            <p className="font-medium">Please check your internet connection or try again later.</p>
        </div>
    );

    return (
        <div className="space-y-10">
            {/* Top Bar / Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">
                        Overview
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Track your rental performance and fleet health in real-time.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => navigate('/vendor/vehicles/add')}
                        className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10"
                    >
                        <Plus size={20} /> ADD VEHICLE
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="Total Inventory" value={stats.totalVehicles} icon={Car} color="blue" />
                <StatCard title="Total Bookings" value={stats.totalBookings} icon={CalendarCheck} color="green" />
                <StatCard title="Total Customers" value={stats.totalCustomers} icon={Users} color="purple" />
                <StatCard title="Net Earnings" value={`₹${stats.totalRevenue || 0}`} icon={DollarSign} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inventory Breakdown */}
                <div className="bg-slate-950 p-10 rounded-[48px] text-white flex flex-col shadow-2xl shadow-slate-950/20">
                    <h3 className="text-2xl font-black tracking-tight mb-8">FLEET TYPE</h3>
                    <div className="space-y-6 flex-1">
                        {stats.typeStats && Object.entries(stats.typeStats).length > 0 ? (
                            Object.entries(stats.typeStats).map(([type, count]) => (
                                <div key={type} className="group cursor-pointer">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-black uppercase text-slate-500 group-hover:text-blue-400 transition-colors">{type}s</span>
                                        <span className="text-lg font-black">{count}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(count / (stats.totalVehicles || 1)) * 100}%` }}
                                            className="h-full bg-blue-600 rounded-full"
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-slate-500 font-bold text-xs italic py-10 text-center">No inventory found</div>
                        )}
                    </div>
                    <button 
                        onClick={() => navigate('/vendor/vehicles')}
                        className="mt-10 py-4 w-full bg-slate-900 border border-slate-800 rounded-2xl font-black text-xs uppercase hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                        Manage Inventory <ChevronRight size={14}/>
                    </button>
                </div>

                {/* Popular Vehicle */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Most Booked</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Best performing vehicle this month</p>
                            </div>
                            <Star className="text-yellow-500 fill-yellow-500" size={32} />
                        </div>
                        
                        {stats.mostBooked ? (
                            <div className="flex flex-col md:flex-row gap-10 items-center">
                                <img 
                                    src={stats.mostBooked.images[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf'} 
                                    className="w-full md:w-64 h-48 object-cover rounded-3xl shadow-lg" 
                                    alt="" 
                                />
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <h4 className="text-3xl font-black text-slate-900 leading-tight">
                                            {stats.mostBooked.make} {stats.mostBooked.model}
                                        </h4>
                                        <div className="mt-2 flex gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Bookings</span>
                                                <span className="text-xl font-black text-blue-600">{stats.mostBooked.bookingCount}</span>
                                            </div>
                                            <div className="flex flex-col pl-4 border-l border-slate-100">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Revenue</span>
                                                <span className="text-xl font-black text-slate-900">₹{stats.mostBooked.revenue || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                        <button 
                                            onClick={() => {
                                                const vid = stats.mostBooked._id || stats.mostBooked.id;
                                                if (vid) navigate(`/vendor/vehicle/${vid}/customers`);
                                                else toast.error('Vehicle ID missing');
                                            }}
                                            className="bg-slate-50 text-slate-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-slate-100 transition-all flex items-center gap-2"
                                        >
                                            View Vehicle Stats <ChevronRight size={12}/>
                                        </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-slate-400 font-bold italic">
                                Not enough data yet.
                            </div>
                        )}
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-8">Recent Bookings</h3>
                        <div className="space-y-4">
                            {stats.recentBookings && stats.recentBookings.length > 0 ? (
                                stats.recentBookings.map((b) => (
                                    <div key={b._id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-white font-black">
                                                {b.userId?.name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <span className="font-black text-slate-900 block">{b.userId?.name || 'Customer'}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{b.vehicleId?.make} {b.vehicleId?.model}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-black text-blue-600 block">₹{b.totalAmount}</span>
                                            <span className={`text-[9px] font-black uppercase ${b.status === 'confirmed' ? 'text-green-500' : 'text-yellow-500'}`}>{b.status}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-10 text-center text-slate-400 font-bold italic">No recent bookings</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboardNew;
