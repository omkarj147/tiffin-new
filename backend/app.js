const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: [
        'https://tiffin-new-1.onrender.com',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Handle PWA manifest and service worker
app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/manifest.json'));
});

app.get('/service-worker.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/service-worker.js'));
});

// Catch-all route handler for client-side routing
app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

module.exports = app;
