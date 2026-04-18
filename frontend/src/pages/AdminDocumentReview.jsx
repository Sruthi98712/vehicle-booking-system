import React, { useEffect, useState } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import api from '../api';
import { toast } from 'react-toastify';

export default function AdminDocumentReview() {
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [reviewDialog, setReviewDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchPendingVendors();
    }, []);

    const fetchPendingVendors = async () => {
        try {
            const res = await api.get('/v1/admin/vendors/pending');
            setVendors(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch pending vendors');
        }
    };

    const handleReview = (vendor) => {
        setSelectedVendor(vendor);
        setReviewDialog(true);
    };

    const submitReview = async (status) => {
        if (status === 'REJECTED' && !rejectionReason) {
            return toast.error('Please provide a rejection reason');
        }

        try {
            await api.post('/v1/admin/vendors/verify', {
                vendorId: selectedVendor._id,
                status,
                rejectionReason: status === 'REJECTED' ? rejectionReason : undefined
            });

            toast.success(`Vendor ${status} successfully`);
            setReviewDialog(false);
            setRejectionReason('');
            fetchPendingVendors(); // Refresh list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Vendor Document Verification</Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Business Name</TableCell>
                            <TableCell>Owner</TableCell>
                            <TableCell>Submitted On</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {vendors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No pending verifications</TableCell>
                            </TableRow>
                        ) : (
                            vendors.map((vendor) => (
                                <TableRow key={vendor._id}>
                                    <TableCell>{vendor.businessName}</TableCell>
                                    <TableCell>
                                        {vendor.userId?.name} <br />
                                        <Typography variant="caption">{vendor.userId?.email}</Typography>
                                    </TableCell>
                                    <TableCell>{new Date(vendor.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Chip label="PENDING" color="warning" size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => handleReview(vendor)}
                                        >
                                            Review
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Review Dialog */}
            <Dialog
                open={reviewDialog}
                onClose={() => setReviewDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Review Vendor: {selectedVendor?.businessName}</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom>Documents:</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                        {selectedVendor?.documents?.map((doc, index) => (
                            <Paper key={index} sx={{ p: 1, border: '1px solid #ddd' }}>
                                <Typography variant="caption" display="block">{doc.type}</Typography>
                                <Button
                                    size="small"
                                    href={doc.url}
                                    target="_blank"
                                    sx={{ mt: 1 }}
                                >
                                    View Document
                                </Button>
                            </Paper>
                        ))}
                    </Box>

                    <Typography variant="subtitle1" gutterBottom spacing={2}>Audit Decision:</Typography>
                    <TextField
                        fullWidth
                        label="Rejection Reason (if rejecting)"
                        multiline
                        rows={2}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => submitReview('REJECTED')}
                    >
                        Reject
                    </Button>
                    <Button
                        color="success"
                        variant="contained"
                        onClick={() => submitReview('APPROVED')}
                    >
                        Approve
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
