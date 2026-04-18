import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ProtectedRoute({ children, allowedRoles }) {
    const user = JSON.parse(localStorage.getItem('user'));
    const location = useLocation();

    useEffect(() => {
        if (!user || !user.token) {
            toast.error('Please login to continue');
        } else if (allowedRoles && !allowedRoles.includes(user.role)) {
            toast.error('You are not authorized to access this page.');
        }
    }, [user, allowedRoles]);

    if (!user || !user.token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children || <Outlet />;
}
