import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Shield, 
    Bell, 
    Camera, 
    Save, 
    Building2,
    Star,
    Car,
    TrendingUp
} from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';

const ProfileTab = ({ active, label, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 font-black uppercase text-xs tracking-widest transition-all border-b-2 ${
            active 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
        }`}
    >
        {label}
    </button>
);

const InputField = ({ label, icon: Icon, value, onChange, name, disabled, type = "text", placeholder }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Icon size={18} />
            </div>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                className={`w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`}
            />
        </div>
    </div>
);

export default function VendorProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        businessName: '',
        businessEmail: '',
        businessPhone: '',
        publicDescription: '',
        latitude: '',
        longitude: '',
        addressLine: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/v1/user/profile');
            const data = res.data.data;
            setUser(data);
            setFormData({
                name: data.name || '',
                phone: data.phone || '',
                businessName: data.vendorProfile?.businessName || '',
                businessEmail: data.vendorProfile?.businessEmail || '',
                businessPhone: data.vendorProfile?.businessPhone || '',
                publicDescription: data.vendorProfile?.publicDescription || '',
                latitude: data.vendorProfile?.location?.latitude || '',
                longitude: data.vendorProfile?.location?.longitude || '',
                addressLine: data.vendorProfile?.location?.address || ''
            });
        } catch (err) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/v1/user/profile', formData);
            toast.success('Profile updated successfully');
            fetchProfile();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header Card */}
            <div className="bg-slate-950 p-10 rounded-[48px] text-white overflow-hidden relative shadow-2xl shadow-slate-950/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
                <div className="relative flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[32px] bg-blue-600 flex items-center justify-center text-4xl font-black shadow-xl shadow-blue-600/30 overflow-hidden">
                            {user.name?.[0]}
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-3 bg-white text-slate-950 rounded-2xl shadow-lg hover:scale-110 transition-transform">
                            <Camera size={18} />
                        </button>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                            <h1 className="text-4xl font-black tracking-tighter uppercase">{user.name}</h1>
                            <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-blue-600/30 tracking-widest">
                                Premium Vendor
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-400 font-bold uppercase text-xs tracking-widest">
                            <div className="flex items-center gap-2">
                                <Mail size={14} className="text-blue-500" />
                                {user.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-blue-500" />
                                {user.phone || 'No phone'}
                            </div>
                            <div className="flex items-center gap-2 text-yellow-500">
                                <Star size={14} fill="currentColor" />
                                {user.averageRating?.toFixed(1) || '0.0'} Rating
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Quick Stats */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-2">My Overview</h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                                        <Car size={20} />
                                    </div>
                                    <span className="font-black text-xs uppercase text-slate-600 tracking-wider">Total Fleet</span>
                                </div>
                                <span className="text-xl font-black text-slate-900">{user.vendorProfile?.totalBookings || 0}</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                                        <TrendingUp size={20} />
                                    </div>
                                    <span className="font-black text-xs uppercase text-slate-600 tracking-wider">Growth</span>
                                </div>
                                <span className="text-xl font-black text-slate-900">+12%</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-[11px] font-bold text-slate-400 uppercase leading-relaxed">
                                You have been a trusted partner since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}. Keep up the great work!
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-600 p-8 rounded-[40px] text-white shadow-xl shadow-blue-600/20">
                         <div className="flex items-center gap-4 mb-4">
                             <Shield size={32} />
                             <h4 className="text-lg font-black uppercase leading-tight">Identity Verified</h4>
                         </div>
                         <p className="text-xs font-bold text-blue-100 leading-relaxed mb-6 opacity-80">
                             Your documents have been verified by the RENTALX team. You are eligible for high-value fleet listings.
                         </p>
                         <button className="w-full py-3 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-colors">
                             View Certificate
                         </button>
                    </div>
                </div>

                {/* Right: Detailed Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 pt-8 flex border-b border-slate-100 bg-slate-50/50">
                            <ProfileTab active={activeTab === 'personal'} label="Personal Details" onClick={() => setActiveTab('personal')} />
                            <ProfileTab active={activeTab === 'business'} label="Business Profile" onClick={() => setActiveTab('business')} />
                            <ProfileTab active={activeTab === 'security'} label="Preferences" onClick={() => setActiveTab('security')} />
                        </div>

                        <form onSubmit={handleSubmit} className="p-10">
                            <AnimatePresence mode="wait">
                                {activeTab === 'personal' && (
                                    <motion.div
                                        key="personal"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        <InputField label="Full Name" name="name" icon={User} value={formData.name} onChange={handleChange} />
                                        <InputField label="Phone Number" name="phone" icon={Phone} value={formData.phone} onChange={handleChange} />
                                        <div className="md:col-span-2">
                                             <InputField label="Email Address" icon={Mail} value={user.email} disabled />
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'business' && (
                                    <motion.div
                                        key="business"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InputField label="Business Name" name="businessName" icon={Building2} value={formData.businessName} onChange={handleChange} />
                                            <InputField label="Business Phone" name="businessPhone" icon={Phone} value={formData.businessPhone} onChange={handleChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider ml-1">Business Address</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                    <MapPin size={18} />
                                                </div>
                                                <textarea
                                                    name="addressLine"
                                                    value={formData.addressLine}
                                                    onChange={handleChange}
                                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none min-h-[100px]"
                                                    placeholder="Enter full business address..."
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InputField label="Latitude" name="latitude" icon={MapPin} value={formData.latitude} onChange={handleChange} />
                                            <InputField label="Longitude" name="longitude" icon={MapPin} value={formData.longitude} onChange={handleChange} />
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'security' && (
                                    <motion.div
                                        key="security"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-200">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-2xl shadow-sm"><Bell size={20} className="text-blue-600" /></div>
                                                    <div>
                                                        <h4 className="font-black text-sm text-slate-900 uppercase">Email Notifications</h4>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Booking alerts and system updates</p>
                                                    </div>
                                                </div>
                                                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="mt-10 w-full md:w-auto px-10 py-4 bg-slate-950 text-white rounded-[24px] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-slate-950/10"
                            >
                                <Save size={18} />
                                Save Profile Changes
                            </motion.button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
