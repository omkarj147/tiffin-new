const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menuRoutes');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const reportRoutes = require('./routes/reports');
const seedRoutes = require('./routes/seed');
const walletRoutes = require('./routes/wallet');
const pwaRoutes = require('./routes/pwaRoutes');

dotenv.config();
const app = express();

// Middleware
app.use(cors({
    origin: [
        'https://tiffin-new-1.onrender.com', 
        'https://tiffin-new.onrender.com',
        'http://localhost:3000', 
        'http://localhost:5002'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files from the React app with cache control
app.use(express.static(path.join(__dirname, '../frontend/build'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/wallet', walletRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Error handling middleware for API routes
app.use('/api', (err, req, res, next) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({ 
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Catch-all route for SPA routing
app.get('*', (req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    } else {
        res.status(404).json({ message: 'Not Found' });
    }
});

module.exports = app;
