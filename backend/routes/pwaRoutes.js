const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// Serve manifest.json
router.get('/manifest.json', async (req, res) => {
    try {
        const manifestPath = path.join(__dirname, '../../frontend/public/manifest.json');
        const manifest = await fs.readFile(manifestPath, 'utf-8');
        res.setHeader('Content-Type', 'application/json');
        res.send(manifest);
    } catch (error) {
        console.error('Error serving manifest:', error);
        res.status(500).json({ error: 'Error serving manifest file' });
    }
});

// Serve service worker
router.get('/service-worker.js', async (req, res) => {
    try {
        const swPath = path.join(__dirname, '../../frontend/public/service-worker.js');
        const serviceWorker = await fs.readFile(swPath, 'utf-8');
        res.setHeader('Content-Type', 'application/javascript');
        res.send(serviceWorker);
    } catch (error) {
        console.error('Error serving service worker:', error);
        res.status(500).json({ error: 'Error serving service worker' });
    }
});

// Handle all static file requests from build directory
router.get('/static/*', (req, res) => {
    const buildPath = path.join(__dirname, '../../frontend/build');
    res.sendFile(req.path, { root: buildPath }, err => {
        if (err) {
            console.error(`Error serving ${req.path}:`, err);
            // Don't send error response, let it fall through to the next handler
            res.status(404).end();
        }
    });
});

// Handle icon requests
router.get('/icons/*', (req, res) => {
    const iconPath = path.join(__dirname, '../../frontend/public', req.path);
    res.sendFile(iconPath, err => {
        if (err) {
            console.error(`Error serving icon ${req.path}:`, err);
            res.status(404).end();
        }
    });
});

// Fallback route for SPA - must be last
router.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

module.exports = router;
