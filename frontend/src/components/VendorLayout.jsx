import React from 'react';
import { Outlet } from 'react-router-dom';
import VendorSidebar from './VendorSidebar';
import { motion, AnimatePresence } from 'framer-motion';

const VendorLayout = () => {
    return (
        <div className="flex bg-slate-50 min-h-screen">
            <VendorSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default VendorLayout;
