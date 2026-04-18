import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    Container, 
    Typography, 
    Grid, 
    Card, 
    CardContent, 
    CardActionArea,
    useTheme
} from '@mui/material';
import {
    DirectionsCar,
    TwoWheeler,
    ElectricRickshaw,
    AirportShuttle,
    LocalShipping,
    Agriculture,
    DirectionsBus,
    DirectionsBike
} from '@mui/icons-material';
import api from '../api';

const categories = [
    { name: 'Car', type: 'car', icon: <DirectionsCar sx={{ fontSize: 40 }} /> },
    { name: 'Bike', type: 'bike', icon: <TwoWheeler sx={{ fontSize: 40 }} /> },
    { name: 'Auto', type: 'auto', icon: <ElectricRickshaw sx={{ fontSize: 40 }} /> },
    { name: 'Van', type: 'van', icon: <AirportShuttle sx={{ fontSize: 40 }} /> },
    { name: 'Truck', type: 'truck', icon: <LocalShipping sx={{ fontSize: 40 }} /> },
    { name: 'Tractor', type: 'tractor', icon: <Agriculture sx={{ fontSize: 40 }} /> },
    { name: 'Bus', type: 'bus', icon: <DirectionsBus sx={{ fontSize: 40 }} /> },
    { name: 'Cycle', type: 'cycle', icon: <DirectionsBike sx={{ fontSize: 40 }} /> }
];

const BrowseVehicles = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const queryParams = new URLSearchParams(window.location.search);
    const locationParam = queryParams.get('location');
    const [counts, setCounts] = useState({});

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const response = await api.get('/v1/vehicles');
                if (response.data.success) {
                    const vehicles = response.data.data;
                    const newCounts = {};
                    categories.forEach(cat => {
                        newCounts[cat.type] = vehicles.filter(v => v.type === cat.type).length;
                    });
                    setCounts(newCounts);
                }
            } catch (error) {
                console.error('Error fetching vehicle counts:', error);
            }
        };
        fetchCounts();
    }, []);

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 6 }}>
                Browse Vehicles
            </Typography>
            <Grid container spacing={4}>
                {categories.map((cat) => (
                    <Grid item key={cat.type} xs={12} sm={6} md={3}>
                        <Card 
                            sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                transition: '0.3s',
                                '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 }
                            }}
                        >
                            <CardActionArea 
                                onClick={() => navigate(`/vehicles/type/${cat.type}${locationParam ? `?location=${locationParam}` : ''}`)}
                                sx={{ flexGrow: 1, p: 2, textAlign: 'center' }}
                            >
                                <Box sx={{ mb: 2, color: theme.palette.primary.main }}>
                                    {cat.icon}
                                </Box>
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="h2">
                                        {cat.name}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {counts[cat.type] || 0} available
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default BrowseVehicles;
