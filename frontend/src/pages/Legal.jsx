import React from 'react';
import { Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';

export default function Legal() {
    return (
        <div className="bg-slate-950 min-h-screen pt-32 pb-20 px-6 font-sans">
            <Container maxWidth="md">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Typography variant="h2" className="text-white font-black mb-8 tracking-tighter">
                        Legal Notices
                    </Typography>
                    <div className="space-y-6 text-slate-400 leading-relaxed">
                        <section>
                            <h3 className="text-xl font-black text-white mb-3">Terms of Use</h3>
                            <p>By using RENTALX, you agree to comply with our terms of service and all applicable laws and regulations.</p>
                        </section>
                        <section>
                            <h3 className="text-xl font-black text-white mb-3">Rental Agreements</h3>
                            <p>All rental agreements are between the vendor and the customer. RENTALX acts as a facilitator for these transactions.</p>
                        </section>
                        <section>
                            <h3 className="text-xl font-black text-white mb-3">Liability</h3>
                            <p>RENTALX is not liable for damages or accidents occurring during a rental period.</p>
                        </section>
                    </div>
                </motion.div>
            </Container>
        </div>
    );
}
