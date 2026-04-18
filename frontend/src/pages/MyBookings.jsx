import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Chip,
    CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Rating, Checkbox, IconButton, InputBase,
    MenuItem
} from '@mui/material';
import { Search, Trash2, Calendar, MapPin, X } from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';
import VendorProfileModal from '../components/VendorProfileModal';

export default function MyBookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewModal, setReviewModal] = useState({ open: false, bookingId: null });
    const [detailsModal, setDetailsModal] = useState({ open: false, data: null });
    const [fetchingDetails, setFetchingDetails] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [vendorProfileModal, setVendorProfileModal] = useState({ open: false, userId: null });
    const [submitting, setSubmitting] = useState(false);

    // New states for search and selection
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [selectedBookings, setSelectedBookings] = useState([]);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/v1/bookings/my');
            setBookings(res.data.data || []);
        } catch (err) {
            toast.error('Error fetching bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedBookings(filteredBookings.map(b => b._id));
        } else {
            setSelectedBookings([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedBookings(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to remove ${selectedBookings.length} bookings from your history?`)) return;
        
        try {
            const res = await api.post('/v1/bookings/bulk-delete', { bookingIds: selectedBookings });
            if (res.data.success) {
                toast.success('Booking history updated');
                setSelectedBookings([]);
                fetchBookings();
            }
        } catch (err) {
            toast.error('Failed to update history');
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = 
            b.vehicleId?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.vehicleId?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        const matchesPayment = paymentFilter === 'all' || b.paymentStatus === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
    });

    const handlePayment = async (bookingId) => {
        try {
            await api.post('/v1/payment/simulate', { bookingId });
            toast.success('Payment simulated successfully!');
            fetchBookings();
        } catch (err) {
            toast.error('Payment simulation failed');
        }
    };

    const handleViewDetails = async (bookingId) => {
        setFetchingDetails(true);
        setDetailsModal({ open: true, data: null });
        try {
            const res = await api.get(`/v1/bookings/${bookingId}/details`);
            setDetailsModal({ open: true, data: res.data.data });
        } catch (err) {
            toast.error('Error fetching booking details');
            setDetailsModal({ open: false, data: null });
        } finally {
            setFetchingDetails(false);
        }
    };

    const handleReviewSubmit = async () => {
        if (!reviewData.comment.trim()) {
            toast.warning('Please leave a comment');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/v1/reviews', {
                bookingId: reviewModal.bookingId,
                rating: reviewData.rating,
                comment: reviewData.comment
            });
            toast.success('Review submitted successfully!');
            setReviewModal({ open: false, bookingId: null });
            setReviewData({ rating: 5, comment: '' });
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error submitting review');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'error';
            case 'completed': return 'info';
            default: return 'default';
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, tracking: '-0.02em', uppercase: true }}>Booking History</Typography>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Paper 
                        elevation={0}
                        sx={{ 
                            p: '2px 14px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            width: 250, 
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'grey.200',
                            bgcolor: 'grey.50'
                        }}
                    >
                        <Search size={18} className="text-slate-400" />
                        <InputBase
                            sx={{ ml: 1, flex: 1, fontSize: '0.875rem' }}
                            placeholder="Search vehicle or vendor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <IconButton size="small" onClick={() => setSearchTerm('')}>
                                <X size={14} />
                            </IconButton>
                        )}
                    </Paper>

                    <TextField
                        select
                        size="small"
                        label="Status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                    </TextField>

                    <TextField
                        select
                        size="small"
                        label="Payment"
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    >
                        <MenuItem value="all">All Payment</MenuItem>
                        <MenuItem value="paid">Paid</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                    </TextField>

                    {selectedBookings.length > 0 && (
                        <Button 
                            variant="contained" 
                            color="error" 
                            startIcon={<Trash2 size={16} />}
                            onClick={handleBulkDelete}
                            sx={{ borderRadius: 2.5, fontWeight: 800, px: 3, textTransform: 'none' }}
                        >
                            Delete {selectedBookings.length} items
                        </Button>
                    )}
                </Box>
            </Box>

            {bookings.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 3 }}>You have no bookings yet.</Alert>
            ) : filteredBookings.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 3 }}>No bookings match your search.</Alert>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 5, border: '1px solid', borderColor: 'grey.100', overflow: 'hidden' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedBookings.length > 0 && selectedBookings.length < filteredBookings.length}
                                        checked={filteredBookings.length > 0 && selectedBookings.length === filteredBookings.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', tracking: '0.05em' }}>Vehicle</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', tracking: '0.05em' }}>Dates</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', tracking: '0.05em' }}>Total Price</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', tracking: '0.05em' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', tracking: '0.05em' }}>Payment</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', tracking: '0.05em' }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredBookings.map((booking) => (
                                <TableRow key={booking._id} hover selected={selectedBookings.includes(booking._id)}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedBookings.includes(booking._id)}
                                            onChange={() => handleSelectOne(booking._id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body1" sx={{ fontWeight: 800, color: 'slate.900' }}>
                                            {booking.vehicleId?.make} {booking.vehicleId?.model}
                                        </Typography>
                                        {booking.vendor && (
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                Vendor: <b>{booking.vendor.name}</b> • {booking.vendor.city}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Calendar size={14} className="text-slate-400" />
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>₹{booking.totalAmount}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={booking.status.toUpperCase()}
                                            color={getStatusColor(booking.status)}
                                            size="small"
                                            sx={{ fontWeight: 900, borderRadius: 2, fontSize: '0.65rem', px: 1 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={booking.paymentStatus.toUpperCase()}
                                            variant={booking.paymentStatus === 'paid' ? 'filled' : 'outlined'}
                                            color={booking.paymentStatus === 'paid' ? 'success' : 'warning'}
                                            size="small"
                                            sx={{ fontWeight: 900, borderRadius: 2, fontSize: '0.65rem', px: 1 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {booking.paymentStatus === 'pending' && booking.status !== 'cancelled' && (
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handlePayment(booking._id)}
                                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}
                                                >
                                                    Pay
                                                </Button>
                                            )}
                                            {booking.status === 'completed' && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => setReviewModal({ open: true, bookingId: booking._id })}
                                                    sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
                                                >
                                                    Review
                                                </Button>
                                            )}
                                            {(booking.status === 'confirmed' || booking.status === 'completed') && (
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    onClick={() => handleViewDetails(booking._id)}
                                                    sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
                                                >
                                                    Details
                                                </Button>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Review Modal */}
            <Dialog open={reviewModal.open} onClose={() => setReviewModal({ open: false, bookingId: null })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>Leave a Review</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" gutterBottom color="text.secondary">How was your experience with this vehicle?</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                            <Rating
                                value={reviewData.rating}
                                onChange={(event, newValue) => setReviewData({ ...reviewData, rating: newValue })}
                                size="large"
                            />
                            <Typography sx={{ ml: 2, fontWeight: 700 }}>{reviewData.rating} / 5</Typography>
                        </Box>
                        <TextField
                            label="Your Review"
                            multiline
                            rows={4}
                            fullWidth
                            value={reviewData.comment}
                            onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                            placeholder="Tell us about the vehicle and the vendor service..."
                            sx={{ mt: 1 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setReviewModal({ open: false, bookingId: null })} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleReviewSubmit}
                        variant="contained"
                        disabled={submitting}
                        sx={{ borderRadius: 2, px: 4 }}
                    >
                        {submitting ? <CircularProgress size={24} /> : 'Submit Review'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Booking Details Modal */}
            <Dialog
                open={detailsModal.open}
                onClose={() => setDetailsModal({ open: false, data: null })}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Booking Details</DialogTitle>
                <DialogContent>
                    {fetchingDetails ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                    ) : detailsModal.data ? (
                        <Box sx={{ mt: 1 }}>
                            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                                This booking is {detailsModal.data.status}. Contact details are now visible.
                            </Alert>

                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>VEHICLE</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        {detailsModal.data.vehicle.make} {detailsModal.data.vehicle.model}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        License Plate: <b>{detailsModal.data.vehicle.licensePlate}</b>
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'block', mb: 1 }}>VENDOR DETAILS</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{detailsModal.data.vendor.name}</Typography>
                                        <Button 
                                            size="small" 
                                            sx={{ p: 0, minWidth: 0, textTransform: 'none', fontWeight: 700 }}
                                            onClick={() => setVendorProfileModal({ open: true, userId: detailsModal.data.vendor._id || detailsModal.data.vehicle.vendorId })}
                                        >
                                            View Profile & Reviews
                                        </Button>
                                        <Typography variant="body2">{detailsModal.data.vendor.email}</Typography>
                                        <Typography variant="body2" sx={{ mt: 1 }}>Phone: <b>{detailsModal.data.vendor.phone}</b></Typography>
                                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                            <Button size="small" variant="outlined" component="a" href={`tel:${detailsModal.data.vendor.phone}`} sx={{ minWidth: 0, p: 0.5, borderRadius: 1.5 }} title="Call Vendor">📞</Button>
                                            <Button size="small" variant="outlined" component="a" href={`mailto:${detailsModal.data.vendor.email}`} sx={{ minWidth: 0, p: 0.5, borderRadius: 1.5 }} title="Email Vendor">✉️</Button>
                                            <Button size="small" variant="outlined" component="a" href={`https://wa.me/${detailsModal.data.vendor.phone?.replace(/[^0-9]/g, '')}`} target="_blank" sx={{ minWidth: 0, p: 0.5, borderRadius: 1.5, borderColor: '#25D366', color: '#25D366' }} title="WhatsApp Vendor">💬</Button>
                                        </Box>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'secondary.main', display: 'block', mb: 1 }}>CUSTOMER DETAILS</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{detailsModal.data.customer.name}</Typography>
                                        <Typography variant="body2">{detailsModal.data.customer.email}</Typography>
                                        <Typography variant="body2" sx={{ mt: 1 }}>Phone: <b>{detailsModal.data.customer.phone}</b></Typography>
                                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                            <Button size="small" variant="outlined" component="a" href={`tel:${detailsModal.data.customer.phone}`} sx={{ minWidth: 0, p: 0.5, borderRadius: 1.5 }} title="Call Customer">📞</Button>
                                            <Button size="small" variant="outlined" component="a" href={`mailto:${detailsModal.data.customer.email}`} sx={{ minWidth: 0, p: 0.5, borderRadius: 1.5 }} title="Email Customer">✉️</Button>
                                            <Button size="small" variant="outlined" component="a" href={`https://wa.me/${detailsModal.data.customer.phone?.replace(/[^0-9]/g, '')}`} target="_blank" sx={{ minWidth: 0, p: 0.5, borderRadius: 1.5, borderColor: '#25D366', color: '#25D366' }} title="WhatsApp Customer">💬</Button>
                                        </Box>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>LOCATION</Typography>
                                    <Typography variant="body2">
                                        {detailsModal.data.vendor.location?.address || 'City: ' + (detailsModal.data.vendor.city || 'Standard Location')}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    ) : (
                        <Alert severity="error">Unable to load details.</Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDetailsModal({ open: false, data: null })} variant="contained" fullWidth sx={{ borderRadius: 2 }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <VendorProfileModal 
                open={vendorProfileModal.open} 
                onClose={() => setVendorProfileModal({ open: false, userId: null })}
                vendorUserId={vendorProfileModal.userId}
            />
        </Box>
    );
}
