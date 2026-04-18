import React from 'react';
import {
    AppBar, Toolbar, IconButton, Typography, Box,
    Avatar, Menu, MenuItem, ListItemIcon, Divider,
    Stack, Button, Container, useTheme
} from '@mui/material';
import {
    Menu as MenuIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    DirectionsCar as CarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Navbar({
    user,
    onDrawerToggle,
    showMenuButton = true,
    isLandingPage = false,
    title = 'Dashboard'
}) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const navigate = useNavigate();
    const theme = useTheme();

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = () => {
        handleMenuClose();
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                width: !showMenuButton || isLandingPage ? '100%' : { sm: `calc(100% - 280px)` },
                ml: !showMenuButton || isLandingPage ? 0 : { sm: `280px` },
                bgcolor: isLandingPage ? 'rgba(2, 6, 23, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid',
                borderColor: isLandingPage ? 'rgba(255, 255, 255, 0.05)' : 'divider',
                color: isLandingPage ? '#f8fafc' : 'text.primary',
                zIndex: (theme) => theme.zIndex.drawer + 1
            }}
        >
            <Container maxWidth="xl">
                <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0, sm: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {showMenuButton && !isLandingPage && (
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={onDrawerToggle}
                                sx={{ mr: 2, display: { sm: 'none' } }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        {isLandingPage ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
                                <CarIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 28 }} />
                                <Typography variant="h6" sx={{ fontWeight: 900, color: theme.palette.primary.main, letterSpacing: -0.5 }}>
                                    RENTALX
                                </Typography>
                            </Box>
                        ) : (
                            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                {title}
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 3 } }}>
                        {isLandingPage && (
                            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
                                <Button color="inherit" onClick={() => navigate('/')} sx={{ fontWeight: 600 }}>Home</Button>
                                <Button color="inherit" onClick={() => navigate('/browse-vehicles')} sx={{ fontWeight: 600 }}>Browse</Button>
                            </Box>
                        )}

                        {user ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                                    <Avatar sx={{ width: 35, height: 35, bgcolor: theme.palette.primary.main, fontSize: 16 }}>
                                        {user?.name?.charAt(0) || 'U'}
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    PaperProps={{
                                        sx: { mt: 1.5, borderRadius: 3, minWidth: 200, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }
                                    }}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <Box sx={{ px: 2, py: 1.5 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{user?.name || 'User'}</Typography>
                                        <Typography variant="body2" color="text.secondary">{user?.email || ''}</Typography>
                                    </Box>
                                    <Divider />
                                    <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                                        <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                                        Profile
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
                                        <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                                        Settings
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                        <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                                        Logout
                                    </MenuItem>
                                </Menu>
                            </Box>
                        ) : (
                            <Stack direction="row" spacing={1}>
                                <Button variant="text" onClick={() => navigate('/login')} sx={{ fontWeight: 700 }}>Login</Button>
                                <Button variant="contained" onClick={() => navigate('/register')} sx={{ borderRadius: 2, fontWeight: 700 }}>
                                    Register
                                </Button>
                            </Stack>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
