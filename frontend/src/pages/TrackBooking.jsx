import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    IconButton,
    Chip
} from '@mui/material';
import {
    ArrowBack,
    LocationOn,
    Navigation,
    StopCircle,
    Person
} from '@mui/icons-material';
import { useSocket } from '../context/SocketContext';
import api from '../api';
import { toast } from 'react-toastify';

const mapContainerStyle = {
    width: '100%',
    height: 'calc(100vh - 150px)',
};

const defaultCenter = {
    lat: 12.9716,
    lng: 77.5946,
};

export default function TrackBooking() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { socket, joinBooking, updateLocation } = useSocket();
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "REPLACE_WITH_YOUR_KEY"
    });

    const [booking, setBooking] = useState(null);
    const [vendorLocation, setVendorLocation] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [watchId, setWatchId] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));
    const isVendor = user?.role === 'vendor';

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await api.get(`/v1/bookings/${id}/details`);
                setBooking(res.data.data);
                if (res.data.data.vendor?.location?.latitude) {
                    setVendorLocation({
                        lat: Number(res.data.data.vendor.location.latitude),
                        lng: Number(res.data.data.vendor.location.longitude)
                    });
                }
            } catch (err) {
                toast.error('Failed to load booking details');
            }
        };
        fetchBooking();
    }, [id]);

    useEffect(() => {
        if (socket && id) {
            joinBooking(id);
            socket.on('location_update', (data) => {
                if (data.bookingId === id) {
                    setVendorLocation(data.location);
                }
            });
        }
        return () => {
            if (socket) socket.off('location_update');
        };
    }, [socket, id]);

    const startTracking = () => {
        if (navigator.geolocation) {
            const id_watch = navigator.geolocation.watchPosition(
                (position) => {
                    const newLoc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setVendorLocation(newLoc);
                    updateLocation(id, newLoc);
                },
                (err) => toast.error('Error getting location: ' + err.message),
                { enableHighAccuracy: true }
            );
            setWatchId(id_watch);
            setIsTracking(true);
            toast.info('Live tracking started');
        } else {
            toast.error('Geolocation not supported');
        }
    };

    const stopTracking = () => {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
        setIsTracking(false);
        toast.info('Live tracking stopped');
    };

    if (!isLoaded || !booking) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        Tracking: {booking.vehicle?.make} {booking.vehicle?.model}
                    </Typography>
                </Box>
                {isVendor && (
                    <Button
                        variant="contained"
                        color={isTracking ? "error" : "primary"}
                        startIcon={isTracking ? <StopCircle /> : <Navigation />}
                        onClick={isTracking ? stopTracking : startTracking}
                        sx={{ borderRadius: 3, fontWeight: 700 }}
                    >
                        {isTracking ? "Stop Sharing" : "Start Live Tracking"}
                    </Button>
                )}
                {!isVendor && (
                    <Chip
                        icon={<Person />}
                        label="Watching Live Vendor Updates"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                    />
                )}
            </Box>

            <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: 10 }}>
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={vendorLocation || defaultCenter}
                    zoom={15}
                >
                    {vendorLocation && (
                        <Marker
                            position={vendorLocation}
                            icon={{
                                url: isVendor ? "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" : "https://maps.google.com/mapfiles/kml/pal4/icon54.png",
                                scaledSize: new window.google.maps.Size(40, 40)
                            }}
                            label={isVendor ? "You" : "Vendor"}
                        />
                    )}
                </GoogleMap>
            </Paper>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Paper sx={{ p: 2, flex: 1, borderRadius: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Status</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{booking.status.toUpperCase()}</Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: 1, borderRadius: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Customer</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{booking.customer?.name}</Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: 1, borderRadius: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Vendor</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{booking.vendor?.name}</Typography>
                </Paper>
            </Box>
        </Box>
    );
}
