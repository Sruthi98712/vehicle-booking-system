import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Car, 
    CalendarCheck, 
    Users, 
    BarChart3, 
    User, 
    LogOut,
    ChevronRight,
    PlusCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, to, badge }) => (
    <NavLink 
        to={to}
        className={({ isActive }) => `
            flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group
            ${isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
        `}
    >
        <div className="flex items-center gap-3">
            <Icon size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-sm">{label}</span>
        </div>
        {badge && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {badge}
            </span>
        )}
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </NavLink>
);

const VendorSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="w-72 h-screen bg-slate-950 border-r border-slate-800 flex flex-col p-6 sticky top-0">
            <div className="mb-10 px-2">
                <h1 className="text-2xl font-black text-white tracking-tighter">
                    RENTALX<span className="text-blue-600">.</span>VENDOR
                </h1>
            </div>

            <div className="flex-1 space-y-2">
                <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/vendor/dashboard" />
                <SidebarItem icon={PlusCircle} label="Add Vehicle" to="/vendor/vehicles/add" />
                
                <div className="pt-4 pb-2 px-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inventory</span>
                </div>
                <SidebarItem icon={Car} label="All Vehicles" to="/vendor/vehicles" />
                <div className="grid grid-cols-2 gap-2 px-2 mt-2">
                    {['car', 'bike', 'truck', 'van'].map(type => (
                        <NavLink 
                            key={type}
                            to={`/vendor/vehicles/${type}`}
                            className={({ isActive }) => `
                                text-[10px] font-black uppercase text-center py-2 rounded-lg border border-slate-800 transition-all
                                ${isActive ? 'bg-blue-600/20 text-blue-400 border-blue-600/30' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}
                            `}
                        >
                            {type}
                        </NavLink>
                    ))}
                </div>

                <div className="pt-4 pb-2 px-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operations</span>
                </div>
                <SidebarItem icon={CalendarCheck} label="Bookings" to="/vendor/bookings" badge="5" />
                <SidebarItem icon={Users} label="Customers" to="/vendor/customers" />
                <SidebarItem icon={BarChart3} label="Analytics" to="/vendor/analytics" />
            </div>

            <div className="mt-auto space-y-2">
                <SidebarItem icon={User} label="My Profile" to="/vendor/profile" />
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-semibold text-sm group"
                >
                    <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default VendorSidebar;
