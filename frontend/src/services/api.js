import axios from 'axios';

// Determine API URL based on environment
const getApiUrl = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost') {
        return 'http://localhost:5002/api';
    } else if (hostname === 'tiffin-new-1.onrender.com') {
        return 'https://tiffin-new.onrender.com/api';
    }
    return 'https://tiffin-new.onrender.com/api'; // default to production // fallback
};

export const API_URL = getApiUrl();

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Enable sending cookies
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
},
(error) => {
    return Promise.reject(error);
});

// Add response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        
        // Handle specific error scenarios
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            switch (error.response.status) {
                case 401:
                    // Redirect to login or handle unauthorized access
                    window.location.href = '/login';
                    break;
                case 404:
                    console.error('Resource not found:', error.response.config.url);
                    break;
                case 500:
                    console.error('Server error');
                    break;
                default:
                    console.error('Unexpected error');
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export const login = async (email, password, userType) => {
    try {
        const response = await api.post('/auth/login', { email, password, userType });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const signup = async (userData) => {
    try {
        const response = await api.post('/auth/signup', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export default api;
