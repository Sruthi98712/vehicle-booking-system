import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';

export default function PublicLayout() {
    const user = JSON.parse(localStorage.getItem('user'));
    const location = useLocation();
    const isLandingPage = location.pathname === '/';

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: isLandingPage ? '#020617' : '#f8fafc' }}>
            <Navbar
                user={user}
                showMenuButton={false}
                isLandingPage={isLandingPage}
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: isLandingPage ? 0 : 3,
                    mt: '64px',
                    width: '100%'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
