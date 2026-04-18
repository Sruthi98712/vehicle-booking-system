import React, { useState, useEffect } from 'react';
import { 
    Calendar, 
    ChevronRight, 
    MoreHorizontal, 
    Clock, 
    CheckCircle2, 
    XCircle,
    User,
    Car,
    CreditCard,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';
import { toast } from 'react-toastify';

const VendorBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                // Not using exact endpoint yet, but let's assume dashboard returns some or we add a new one
                const res = await api.get('/v1/dashboard/vendor');
                setBookings(res.data.data.recentBookings || []);
            } catch (err) {
                toast.error('Error fetching bookings');
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/v1/vendor/bookings/${id}`, { status });
            setBookings(bookings.map(b => b._id === id ? { ...b, status } : b));
            toast.success(`Booking ${status}`);
        } catch (err) {
            toast.error('Error updating status');
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            confirmed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700',
            completed: 'bg-blue-100 text-blue-700'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${styles[status]}`}>
                {status}
            </span>
        );
    };

    const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Bookings</h1>
                    <p className="text-slate-500 font-medium">Manage incoming requests and active rental trips.</p>
                </div>
                <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200">
                    {['all', 'pending', 'confirmed', 'completed'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filter === s ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="animate-spin text-slate-400" size={40} />
                </div>
            ) : filteredBookings.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredBookings.map((b) => (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={b._id}
                            className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-6 items-center"
                        >
                            <div className="flex items-center gap-6 flex-1">
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <Car size={24} className="text-blue-600" />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</span>
                                        <span className="font-black text-slate-900">{b.userId?.name}</span>
                                        <div className="flex flex-col gap-0.5 mt-1">
                                            <span className="text-[10px] font-bold text-slate-500 break-all">{b.userId?.email}</span>
                                            <span className="text-[10px] font-bold text-blue-600">
                                                {b.userId?.mobile || b.userId?.phone || 'No Phone'}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-400">
                                                {[b.userId?.city, b.userId?.state].filter(Boolean).join(', ') || 'Address N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vehicle</span>
                                        <span className="font-black text-slate-900">{b.vehicleId.make} {b.vehicleId.model}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dates</span>
                                        <span className="font-black text-slate-900">{new Date(b.startDate).toLocaleDateString()}</span>
                                        <span className="text-[10px] font-bold text-slate-500">To {new Date(b.endDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</span>
                                        <span className="text-xl font-black text-blue-600">₹{b.totalAmount}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full lg:w-auto flex items-center gap-4 pt-6 lg:pt-0 lg:border-l lg:pl-8 border-slate-100">
                                <StatusBadge status={b.status} />
                                <div className="flex gap-2 ml-auto">
                                    {b.status === 'pending' && (
                                        <>
                                            <button 
                                                onClick={() => handleStatusUpdate(b._id, 'confirmed')}
                                                className="p-3 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-2xl transition-all"
                                                title="Accept"
                                            >
                                                <CheckCircle2 size={20} />
                                            </button>
                                            <button 
                                                onClick={() => handleStatusUpdate(b._id, 'cancelled')}
                                                className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all"
                                                title="Reject"
                                            >
                                                <XCircle size={20} />
                                            </button>
                                        </>
                                    )}
                                    {b.status === 'confirmed' && (
                                        <button 
                                            onClick={() => handleStatusUpdate(b._id, 'completed')}
                                            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase hover:bg-blue-600 transition-all flex items-center gap-2"
                                        >
                                            Complete Trip
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-16 rounded-[48px] text-center border-2 border-dashed border-slate-200">
                    <span className="text-slate-300 text-6xl block mb-6 font-bold tracking-tighter">00</span>
                    <h2 className="text-2xl font-black text-slate-900 uppercase mb-2">No bookings found</h2>
                    <p className="text-slate-500 font-medium italic">Wait for incoming requests or check other filters.</p>
                </div>
            )}
        </div>
    );
};

export default VendorBookings;
