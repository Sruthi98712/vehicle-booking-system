import React, { useState } from 'react';
import {
    Box, Typography, Paper, TextField, Button, Grid,
    Switch, FormControlLabel, Divider, Dialog, DialogTitle,
    DialogContent, DialogContentText, DialogActions, CircularProgress
} from '@mui/material';
import { Security as SecurityIcon, Notifications as NotificationsIcon, DeleteForever as DeleteIcon } from '@mui/icons-material';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const navigate = useNavigate();
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [changingPassword, setChangingPassword] = useState(false);

    const [openDelete, setOpenDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const submitPasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setChangingPassword(true);
        try {
            await api.put('/v1/user/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error changing password');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            await api.delete('/v1/user/delete-account');
            toast.success('Your account has been deleted');
            localStorage.removeItem('user');
            navigate('/login');
            window.location.reload();
        } catch (err) {
            toast.error('Error deleting account');
            setOpenDelete(false);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, pb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>Account Settings</Typography>

            {/* Change Password Section */}
            <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SecurityIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Security & Password</Typography>
                </Box>
                <Box component="form" onSubmit={submitPasswordUpdate}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Current Password"
                                name="currentPassword"
                                type="password"
                                fullWidth
                                required
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="New Password"
                                name="newPassword"
                                type="password"
                                fullWidth
                                required
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Confirm New Password"
                                name="confirmPassword"
                                type="password"
                                fullWidth
                                required
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={changingPassword}
                                sx={{ borderRadius: 2, px: 4 }}
                            >
                                {changingPassword ? <CircularProgress size={24} /> : 'Update Password'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            {/* Notification Preferences */}
            <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <NotificationsIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Communication Preferences</Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={<Switch defaultChecked color="primary" />}
                            label="Email Notifications for Bookings"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={<Switch defaultChecked color="primary" />}
                            label="Flash Sale & Promotional Alerts"
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Danger Zone */}
            <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'error.light', bgcolor: '#fff5f5' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DeleteIcon color="error" sx={{ mr: 2 }} />
                    <Typography variant="h6" color="error" sx={{ fontWeight: 700 }}>Danger Zone</Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
                    Once you delete your account, there is no going back. Please be certain.
                </Typography>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setOpenDelete(true)}
                    sx={{ borderRadius: 2 }}
                >
                    Delete My Account
                </Button>
            </Paper>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
                <DialogTitle sx={{ fontWeight: 700 }}>Delete Account permanently?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete your account? All your personal information and booking history will be removed. This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDelete(false)} disabled={deleting}>Cancel</Button>
                    <Button
                        onClick={handleDeleteAccount}
                        color="error"
                        variant="contained"
                        disabled={deleting}
                        sx={{ borderRadius: 2 }}
                    >
                        {deleting ? <CircularProgress size={20} color="inherit" /> : 'Yes, Delete Account'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
