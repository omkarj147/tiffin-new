import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    console.log('PrivateRoute - Token:', !!token);
    console.log('PrivateRoute - User:', user);

    // Detailed logging for debugging
    React.useEffect(() => {
        console.group('PrivateRoute Debug');
        console.log('Current Path:', location.pathname);
        console.log('Token Exists:', !!token);
        console.log('User Object:', user);
        console.groupEnd();
    }, [location, token, user]);

    if (!token || Object.keys(user).length === 0) {
        console.warn('Redirecting to login due to missing auth');
        // Redirect to login page, but save the current location they were trying to access
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default PrivateRoute;
