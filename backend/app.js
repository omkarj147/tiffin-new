const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Logging middleware
app.use((req, res, next) => {
    console.log(`[ROUTE DEBUG] ${new Date().toISOString()}`);
    console.log(`[ROUTE DEBUG] Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    console.log(`[ROUTE DEBUG] Method: ${req.method}`);
    console.log(`[ROUTE DEBUG] Path: ${req.path}`);
    next();
});

// Comprehensive CORS configuration
app.use(cors({
    origin: [
        'https://tiffin-new-1.onrender.com',
        //'http://localhost:5002',
        'http://localhost:3000',
        'https://tiffin-new.onrender.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menuRoutes');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const reportRoutes = require('./routes/reports');
const seedRoutes = require('./routes/seed');
const walletRoutes = require('./routes/wallet');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/wallet', walletRoutes);

// Catch-all route handler for client-side routing
app.get('*', (req, res) => {
    console.log('[ROUTE DEBUG] Catch-all route triggered');
    console.log('[ROUTE DEBUG] Requested path:', req.path);

    // Explicitly reject API routes
    if (req.path.startsWith('/api')) {
        console.log('[ROUTE DEBUG] API route rejected');
        return res.status(404).json({ message: 'API endpoint not found' });
    }

    // Respond with a generic 404 for non-API routes
    res.status(404).json({ 
        message: 'Not Found', 
        path: req.path 
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[ROUTE DEBUG] Unhandled error:', err);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.toString() : {}
    });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

module.exports = app;
