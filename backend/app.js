const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const app = express();

// Detailed logging middleware
app.use((req, res, next) => {
    console.log(`[ROUTE DEBUG] ${new Date().toISOString()}`);
    console.log(`[ROUTE DEBUG] Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    console.log(`[ROUTE DEBUG] Method: ${req.method}`);
    console.log(`[ROUTE DEBUG] Path: ${req.path}`);
    console.log(`[ROUTE DEBUG] Headers: ${JSON.stringify(req.headers)}`);
    next();
});

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
const frontendBuildPath = path.join(__dirname, '../frontend/build');
console.log('[ROUTE DEBUG] Frontend build path:', frontendBuildPath);
console.log('[ROUTE DEBUG] Frontend build exists:', fs.existsSync(frontendBuildPath));

// Serve static files with additional logging and configuration
app.use(express.static(frontendBuildPath, {
    setHeaders: (res, filePath) => {
        if (path.extname(filePath) === '.html') {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));

// Debugging route to check static file serving
app.get('/debug-static', (req, res) => {
    const files = fs.readdirSync(frontendBuildPath);
    res.json({
        buildPath: frontendBuildPath,
        files: files
    });
});

// Comprehensive catch-all route handler for client-side routing
app.get('*', (req, res) => {
    console.log('[ROUTE DEBUG] Catch-all route triggered');
    console.log('[ROUTE DEBUG] Requested path:', req.path);

    // Explicit checks for API routes
    if (req.path.startsWith('/api')) {
        console.log('[ROUTE DEBUG] API route rejected');
        return res.status(404).json({ message: 'API endpoint not found' });
    }

    // Specific checks for known routes
    const indexPath = path.join(frontendBuildPath, 'index.html');
    console.log('[ROUTE DEBUG] Index.html path:', indexPath);
    console.log('[ROUTE DEBUG] Index.html exists:', fs.existsSync(indexPath));

    // Fallback to serving index.html
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        console.error('[ROUTE DEBUG] index.html not found!');
        res.status(500).send('Server configuration error');
    }
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
