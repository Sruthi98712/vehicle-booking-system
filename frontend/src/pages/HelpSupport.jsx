import React, { useState } from 'react';
import {
    Box, Typography, Paper, Grid, TextField, Button,
    Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Send as SendIcon, HelpOutline as HelpIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

const faqs = [
    {
        q: "How do I book a vehicle?",
        a: "Navigate to the Vehicles page, select the vehicle you want, choose your dates, and click 'Book Now'."
    },
    {
        q: "What documents are required?",
        a: "You need a valid driving license and a government-issued ID (like Passport or Aadhaar card)."
    },
    {
        q: "Can I cancel my booking?",
        a: "Yes, you can cancel your booking from the 'My Bookings' page up to 24 hours before the start time for a full refund."
    },
    {
        q: "Is there a security deposit?",
        a: "A refundable security deposit of $100 - $500 depending on the vehicle type will be held at the time of pickup."
    }
];

export default function HelpSupport() {
    const [ticket, setTicket] = useState({ name: '', email: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            toast.success('Support ticket submitted successfully! We will get back to you soon.');
            setTicket({ name: '', email: '', message: '' });
            setLoading(false);
        }, 1500);
    };

    return (
        <Box sx={{ mt: 4, pb: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, mb: 4 }}>Help & Support</Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                        <HelpIcon sx={{ mr: 1, color: 'primary.main' }} /> Frequently Asked Questions
                    </Typography>
                    {faqs.map((faq, index) => (
                        <Accordion key={index} sx={{ mb: 1, borderRadius: '8px !important', '&:before': { display: 'none' }, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography sx={{ fontWeight: 600 }}>{faq.q}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography color="text.secondary">{faq.a}</Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Grid>

                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 4, borderRadius: 4 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Contact Support</Typography>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Name"
                                        required
                                        value={ticket.name}
                                        onChange={(e) => setTicket({ ...ticket, name: e.target.value })}
                                        sx={{ bgcolor: 'white' }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        required
                                        value={ticket.email}
                                        onChange={(e) => setTicket({ ...ticket, email: e.target.value })}
                                        sx={{ bgcolor: 'white' }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Message"
                                        multiline
                                        rows={4}
                                        required
                                        value={ticket.message}
                                        onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
                                        sx={{ bgcolor: 'white' }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        type="submit"
                                        disabled={loading}
                                        startIcon={<SendIcon />}
                                        sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, mt: 1 }}
                                    >
                                        {loading ? 'Submitting...' : 'Submit Ticket'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
