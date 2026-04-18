import React from 'react';
import { Box, Container, Typography, TextField, Button, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
    return (
        <div className="bg-slate-950 min-h-screen pt-32 pb-20 px-6 font-sans">
            <Container maxWidth="lg">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Typography variant="h2" className="text-white font-black mb-12 tracking-tighter text-center">
                        Get In Touch
                    </Typography>

                    <Grid container spacing={8}>
                        <Grid item xs={12} md={6}>
                            <div className="space-y-8">
                                <h3 className="text-3xl font-black text-white mb-6">Contact Information</h3>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">Email Us</p>
                                        <p className="text-slate-400 font-medium">support@rentalx.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 border border-green-500/20">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">Call Us</p>
                                        <p className="text-slate-400 font-medium">+1 (555) 000-0000</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 border border-purple-500/20">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">Visit Us</p>
                                        <p className="text-slate-400 font-medium">123 Mobility St, Tech City, Global</p>
                                    </div>
                                </div>
                            </div>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <div className="bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-xl">
                                <form className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <TextField
                                            fullWidth
                                            label="Name"
                                            variant="outlined"
                                            InputProps={{ style: { color: 'white' } }}
                                            InputLabelProps={{ style: { color: '#94a3b8' } }}
                                            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#1e293b' }, '&:hover fieldset': { borderColor: '#3b82f6' } } }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            variant="outlined"
                                            InputProps={{ style: { color: 'white' } }}
                                            InputLabelProps={{ style: { color: '#94a3b8' } }}
                                            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#1e293b' }, '&:hover fieldset': { borderColor: '#3b82f6' } } }}
                                        />
                                    </div>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        label="Message"
                                        variant="outlined"
                                        InputProps={{ style: { color: 'white' } }}
                                        InputLabelProps={{ style: { color: '#94a3b8' } }}
                                        sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#1e293b' }, '&:hover fieldset': { borderColor: '#3b82f6' } } }}
                                    />
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        className="bg-blue-600 hover:bg-blue-700 h-16 rounded-2xl font-black text-lg"
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Send Message
                                    </Button>
                                </form>
                            </div>
                        </Grid>
                    </Grid>
                </motion.div>
            </Container>
        </div>
    );
}
