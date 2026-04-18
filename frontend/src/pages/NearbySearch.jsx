import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    CircularProgress,
    IconButton,
    Paper,
    Slider
} from '@mui/material';
import {
    Navigation as NavigationIcon,
    Star as StarIcon,
    Close as CloseIcon,
    DirectionsCar as CarIcon
} from '@mui/icons-material';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const mapContainerStyle = {
    width: '100%',
    height: 'calc(100vh - 64px)',
};

const center = {
    lat: 12.9716, // Bangalore default
    lng: 77.5946,
};

const options = {
    disableDefaultUI: false,
    zoomControl: true,
};

export default function NearbySearch() {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "REPLACE_WITH_YOUR_KEY" // Use your API key or process.env
    });

    const navigate = useNavigate();
    const [map, setMap] = useState(null);
    const [userLocation, setUserLocation] = useState(center);
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [radius, setRadius] = useState(5);
    const [loading, setLoading] = useState(false);

    const fetchNearbyVehicles = async (lat, lng) => {
        setLoading(true);
        try {
            const res = await api.get('/v1/vehicles/nearby', {
                params: { latitude: lat, longitude: lng, radius }
            });
            setVehicles(res.data.data);
        } catch (err) {
            console.error('Error fetching nearby vehicles:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setUserLocation(loc);
                    fetchNearbyVehicles(loc.lat, loc.lng);
                },
                () => fetchNearbyVehicles(center.lat, center.lng)
            );
        } else {
            fetchNearbyVehicles(center.lat, center.lng);
        }
    }, [radius]);

    const onLoad = useCallback(function callback(m) {
        setMap(m);
    }, []);

    const onUnmount = useCallback(function callback(m) {
        setMap(null);
    }, []);

    if (!isLoaded) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ position: 'relative' }}>
            {/* Search/Filter Overlay */}
            <Paper
                sx={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    zIndex: 1,
                    p: 3,
                    width: 300,
                    borderRadius: 4,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Discover Nearby</Typography>
                <Typography variant="caption" color="text.secondary">Radius: {radius} km</Typography>
                <Slider
                    value={radius}
                    min={1}
                    max={50}
                    onChange={(e, val) => setRadius(val)}
                    valueLabelDisplay="auto"
                    sx={{ mb: 2 }}
                />
                <Button
                    fullWidth
                    variant="contained"
                    startIcon={<NavigationIcon />}
                    onClick={() => fetchNearbyVehicles(userLocation.lat, userLocation.lng)}
                    sx={{ borderRadius: 2 }}
                >
                    Refresh Search
                </Button>
            </Paper>

            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={userLocation}
                zoom={12}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={options}
            >
                {/* User Location Marker */}
                <Marker
                    position={userLocation}
                    icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    }}
                />

                {/* Vehicle Markers */}
                {vehicles.map((v) => (
                    <Marker
                        key={v._id}
                        position={{
                            lat: v.location?.coordinates[1] || center.lat,
                            lng: v.location?.coordinates[0] || center.lng
                        }}
                        onClick={() => setSelectedVehicle(v)}
                        icon={{
                            path: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
                            fillColor: '#3b82f6',
                            fillOpacity: 1,
                            strokeWeight: 1,
                            strokeColor: '#ffffff',
                            scale: 1.5,
                            anchor: new google.maps.Point(12, 12),
                        }}
                    />
                ))}

                {selectedVehicle && (
                    <InfoWindow
                        position={{
                            lat: selectedVehicle.location?.coordinates[1] || center.lat,
                            lng: selectedVehicle.location?.coordinates[0] || center.lng
                        }}
                        onCloseClick={() => setSelectedVehicle(null)}
                    >
                        <Card sx={{ maxWidth: 250, boxShadow: 'none', position: 'relative' }}>
                            <IconButton
                                size="small"
                                onClick={() => setSelectedVehicle(null)}
                                sx={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                            <Box sx={{ h: 140, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CarIcon sx={{ fontSize: 60, color: 'grey.300' }} />
                            </Box>
                            <CardContent sx={{ p: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>{selectedVehicle.make} {selectedVehicle.model}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <StarIcon sx={{ color: 'orange', fontSize: 16 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedVehicle.averageRating || 'N/A'}</Typography>
                                    <Typography variant="caption" color="text.secondary">By {selectedVehicle.vendorId?.name}</Typography>
                                </Box>
                                <Typography variant="h6" color="primary" sx={{ fontWeight: 900, mb: 2 }}>
                                    ${selectedVehicle.rentalPricePerDay}<span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/day</span>
                                </Typography>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => navigate(`/book/${selectedVehicle._id}`)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Book Now
                                </Button>
                            </CardContent>
                        </Card>
                    </InfoWindow>
                )}
            </GoogleMap>
        </Box>
    );
}
