import React from 'react';
import {
    Box, Toolbar, Typography, Divider, List,
    ListItem, ListItemButton, ListItemIcon, ListItemText,
    Avatar, Paper, useTheme
} from '@mui/material';
import {
    DirectionsCar as CarIcon,
    Dashboard as DashboardIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Book as BookingIcon,
    HelpOutline as HelpIcon,
    Favorite as FavoriteIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ user, onNavItemClick }) {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const getMenuItems = () => {
        const baseItems = [
            { text: 'Vehicles', icon: <CarIcon />, path: '/vehicles' },
            { text: 'Help & Support', icon: <HelpIcon />, path: '/help-support' },
        ];

        if (!user) return baseItems;

        const commonItems = [
            ...baseItems,
            { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
            { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
            { text: 'Saved Vehicles', icon: <FavoriteIcon />, path: '/saved-vehicles' },
        ];

        if (user.role === 'admin') {
            return [
                { text: 'Admin Dashboard', icon: <DashboardIcon />, path: '/admin-dashboard' },
                ...commonItems
            ];
        }

        if (user.role === 'vendor') {
            return [
                { text: 'Vendor Dashboard', icon: <DashboardIcon />, path: '/vendor-dashboard' },
                ...commonItems
            ];
        }

        return [
            { text: 'My Dashboard', icon: <DashboardIcon />, path: '/customer-dashboard' },
            { text: 'My Bookings', icon: <BookingIcon />, path: '/my-bookings' },
            ...commonItems
        ];
    };

    const menuItems = getMenuItems();

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Toolbar sx={{ px: 3, py: 2 }}>
                <CarIcon sx={{ color: theme.palette.primary.main, mr: 1.5, fontSize: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5, color: theme.palette.primary.main }}>
                    RENTALX
                </Typography>
            </Toolbar>
            <Divider sx={{ opacity: 0.5 }} />
            <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.path);
                                    if (onNavItemClick) onNavItemClick();
                                }}
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: isActive ? `${theme.palette.primary.main}10` : 'transparent',
                                    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                                    '&:hover': {
                                        bgcolor: isActive ? `${theme.palette.primary.main}20` : `${theme.palette.primary.main}05`,
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ color: isActive ? theme.palette.primary.main : theme.palette.text.secondary, minWidth: 45 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{ fontWeight: isActive ? 700 : 500 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
            {user && (
                <Box sx={{ p: 3 }}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: `${theme.palette.primary.main}08`, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: theme.palette.primary.main }}>
                                {user?.name?.charAt(0) || 'U'}
                            </Avatar>
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, noWrap: true }}>{user.name}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ noWrap: true }}>{user?.role?.toUpperCase() || ''}</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            )}
        </Box>
    );
}
