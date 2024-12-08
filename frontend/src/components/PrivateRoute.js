import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const PrivateRoute = ({ children, requiredUserType }) => {
    const navigate = useNavigate();
    
    // Get authentication data
    const token = localStorage.getItem('token');
    let user = null;
    
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (error) {
        console.error('Error parsing user data:', error);
    }

    // Not logged in
    if (!token || !user) {
        console.log('No token or user found, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    // Wrong user type
    if (requiredUserType && user.userType !== requiredUserType) {
        console.error(`Access denied: Required user type '${requiredUserType}' but found '${user.userType}'`);
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;
