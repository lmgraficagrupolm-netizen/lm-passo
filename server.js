const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const db = require('./server/database/db');
const fs = require('fs');

// Error Logging Function
const logError = (err) => {
    const errorLogPath = path.join(process.cwd(), 'error_log.txt');
    const errorMessage = `[${new Date().toISOString()}] ERROR: ${err.message}\nSTACK: ${err.stack}\n\n`;
    fs.appendFileSync(errorLogPath, errorMessage);
};

// Global Error Handlers
process.on('uncaughtException', (err) => {
    logError(err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logError(new Error(`Unhandled Rejection: ${reason}`));
});

// Ensure DB directory exists (for Railway persistent volume at /data)
if (process.env.DB_PATH) {
    try {
        const dbDir = path.dirname(process.env.DB_PATH);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
    } catch (err) { logError(err); }
}

// Ensure uploads directory exists in the real filesystem
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (err) {
    logError(err);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression()); // gzip all responses
app.use(cors());
app.use(express.json());
// Force no-cache for JS and CSS so browser always fetches fresh versions after deploy
app.use((req, res, next) => {
    if (req.path.endsWith('.js') || req.path.endsWith('.css')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    next();
});
// Serve internal assets — prefer disk (allows live updates), fall back to embedded snapshot
const diskPublic = path.join(process.cwd(), 'public');
if (fs.existsSync(diskPublic)) {
    app.use(express.static(diskPublic));           // ← uses real files from disk
} else {
    app.use(express.static(path.join(__dirname, 'public'))); // ← fallback: embedded
}
// Serve external uploads (user files) always from disk
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// Health check (Railway / Render)
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Routes
const authRoutes = require('./server/routes/auth.routes');
const apiRoutes = require('./server/routes/api.routes');

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Basic Route

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
const os = require('os');
app.listen(PORT, '0.0.0.0', () => {
    const nets = os.networkInterfaces();
    let localIp = 'localhost';
    for (const iface of Object.values(nets)) {
        for (const alias of iface) {
            if (alias.family === 'IPv4' && !alias.internal) {
                localIp = alias.address;
                break;
            }
        }
    }
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Acesso em rede:  http://${localIp}:${PORT}`);
});
