import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Drawer, useTheme, useMediaQuery, Container } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const drawerWidth = 280;

export default function DashboardLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));

    React.useEffect(() => {
        if (!user || !user.token) {
            window.location.href = '/login';
        }
    }, [user]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            <Navbar
                user={user}
                onDrawerToggle={handleDrawerToggle}
                title={location.pathname.split('/').pop()?.replace('-', ' ').toUpperCase() || 'Dashboard'}
            />

            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    <Sidebar user={user} onNavItemClick={() => setMobileOpen(false)} />
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' },
                    }}
                    open
                >
                    <Sidebar user={user} />
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: '64px',
                }}
            >
                <Container maxWidth="xl" sx={{ py: 2 }}>
                    <Outlet />
                </Container>
            </Box>
        </Box>
    );
}
