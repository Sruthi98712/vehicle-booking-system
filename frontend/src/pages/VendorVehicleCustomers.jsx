import React, { useState, useEffect } from 'react';
import { 
    Users, 
    ChevronLeft, 
    Mail, 
    Phone, 
    Calendar, 
    Info,
    Star,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const VendorVehicleCustomers = () => {
    const { vehicleId } = useParams();
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            if (!vehicleId || vehicleId === 'undefined') {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get(`/v1/vendor/vehicle/${vehicleId}/customers`);
                setCustomers(res.data.data);
            } catch (err) {
                toast.error('Error fetching customers');
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, [vehicleId]);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                >
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Vehicle History</h1>
                    <p className="text-slate-500 font-medium">List of customers who have rented this vehicle.</p>
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="animate-spin text-slate-400" size={40} />
                </div>
            ) : customers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {customers.map((c, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx}
                            className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${c.status === 'completed' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                    {c.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center text-white text-2xl font-black">
                                    {c.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 leading-tight">{c.name}</h3>
                                    <div className="flex items-center gap-1 text-slate-400 mt-1">
                                        <Calendar size={12} />
                                        <span className="text-[10px] font-bold uppercase">{new Date(c.bookingDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                    <Mail size={16} className="text-slate-400 group-hover:text-blue-500" />
                                    <span className="text-sm font-bold text-slate-700">{c.email}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                    <Phone size={16} className="text-slate-400 group-hover:text-blue-500" />
                                    <span className="text-sm font-bold text-slate-700">{c.phone}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => window.open(`tel:${c.phone}`)}
                                    className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-black text-[11px] uppercase hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                                >
                                    Call
                                </button>
                                <button 
                                    onClick={() => window.open(`mailto:${c.email}`)}
                                    className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-2xl font-black text-[11px] uppercase hover:bg-slate-200 transition-all"
                                >
                                    Email
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-16 rounded-[48px] text-center border-2 border-dashed border-slate-200">
                    <Users className="text-slate-300 mx-auto mb-4" size={48} />
                    <h2 className="text-2xl font-black text-slate-900 uppercase mb-2">No customers yet</h2>
                    <p className="text-slate-500 font-medium">Once customers book this vehicle, they will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default VendorVehicleCustomers;
