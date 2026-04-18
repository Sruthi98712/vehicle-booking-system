import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';

export default function OurVision() {
    return (
        <div className="bg-slate-950 min-h-screen pt-32 pb-20 px-6 font-sans">
            <Container maxWidth="md">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Typography variant="h2" className="text-white font-black mb-8 tracking-tighter">
                        Our Vision
                    </Typography>
                    <div className="space-y-6 text-slate-400 text-lg leading-relaxed">
                        <p>
                            At <span className="text-blue-500 font-bold">RENTALX</span>, we believe that mobility should be seamless,
                            accessible, and empowering for everyone. Our vision is to create the world's most trusted
                            peer-to-peer vehicle rental network, connecting people who have vehicles with those who need them.
                        </p>
                        <p>
                            We are committed to building a platform that prioritizes security, transparency, and ease of use.
                            Whether you're looking for a luxury car for a weekend getaway, a bike for your daily commute,
                            or heavy machinery for a construction project, RENTALX is your one-stop destination.
                        </p>
                        <h3 className="text-2xl font-black text-white mt-12 mb-4">Our Core Values</h3>
                        <ul className="list-disc pl-6 space-y-3">
                            <li><strong className="text-white">Trust:</strong> Verified vendors and transparent reviews.</li>
                            <li><strong className="text-white">Innovation:</strong> Real-time tracking and geospatial discovery.</li>
                            <li><strong className="text-white">Accessibility:</strong> Wide range of vehicles for every budget.</li>
                            <li><strong className="text-white">Community:</strong> Empowering local vendors to grow their businesses.</li>
                        </ul>
                    </div>
                </motion.div>
            </Container>
        </div>
    );
}
