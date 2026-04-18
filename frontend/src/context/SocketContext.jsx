import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Socket.io should connect to the root URL, not the /api subpath
        const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
        const newSocket = io(baseUrl);
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    const joinBooking = (bookingId) => {
        if (socket) socket.emit('join_booking', bookingId);
    };

    const updateLocation = (bookingId, location) => {
        if (socket) socket.emit('update_location', { bookingId, location });
    };

    return (
        <SocketContext.Provider value={{ socket, joinBooking, updateLocation }}>
            {children}
        </SocketContext.Provider>
    );
};
