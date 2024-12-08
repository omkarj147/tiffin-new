import axios from 'axios';

// Determine API URL based on environment
const getApiUrl = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost') {
        return 'http://localhost:5002/api';
    } else if (hostname === 'tiffin-new-1.onrender.com') {
        return 'https://tiffin-new.onrender.com/api';
    }
    return '/api'; // fallback for production
};

export const API_URL = getApiUrl();

// Create axios instance with optimized config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true,
    timeout: 30000, // 30 second timeout
    timeoutErrorMessage: 'Request timed out. Please try again.'
});

// Request interceptor with retry logic
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor with error handling and retry logic
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Retry the request once if it failed
        if (error.response?.status === 500 && !originalRequest._retry) {
            originalRequest._retry = true;
            return api(originalRequest);
        }

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        throw error.response?.data?.message || error.message || 'An error occurred';
    }
);

// Authentication functions with optimized error handling
export const login = async (email, password, userType) => {
    try {
        const response = await api.post('/auth/login', { email, password, userType });
        return response.data;
    } catch (error) {
        console.error('Login Error:', error);
        throw error.response?.data?.message || 'Login failed. Please try again.';
    }
};

export const signup = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        console.error('Signup Error:', error);
        throw error.response?.data?.message || 'Registration failed. Please try again.';
    }
};

export default api;
