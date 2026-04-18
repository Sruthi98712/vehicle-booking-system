import React from 'react';
import { Box, Typography } from '@mui/material';
import VehicleList from '../components/VehicleList';

export default function Vehicles() {
    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Fleet Management</Typography>
                <Typography variant="body1" color="text.secondary">Manage your vehicles, track availability and update pricing information.</Typography>
            </Box>
            <VehicleList />
        </Box>
    );
}
