import React from 'react';
import { Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';

export default function Privacy() {
    return (
        <div className="bg-slate-950 min-h-screen pt-32 pb-20 px-6 font-sans">
            <Container maxWidth="md">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Typography variant="h2" className="text-white font-black mb-8 tracking-tighter">
                        Privacy Policy
                    </Typography>
                    <div className="space-y-6 text-slate-400 leading-relaxed">
                        <section>
                            <h3 className="text-xl font-black text-white mb-3">1. Information We Collect</h3>
                            <p>We collect information you provide directly to us, such as when you create an account, list a vehicle, or make a booking.</p>
                        </section>
                        <section>
                            <h3 className="text-xl font-black text-white mb-3">2. How We Use Information</h3>
                            <p>We use the information to facilitate rentals, provide support, and improve the RENTALX experience.</p>
                        </section>
                        <section>
                            <h3 className="text-xl font-black text-white mb-3">3. Sharing Information</h3>
                            <p>We share contact information between vendors and customers only after a booking is confirmed.</p>
                        </section>
                        <section>
                            <h3 className="text-xl font-black text-white mb-3">4. Security</h3>
                            <p>We take reasonable measures to protect your personal data from unauthorized access.</p>
                        </section>
                    </div>
                </motion.div>
            </Container>
        </div>
    );
}
