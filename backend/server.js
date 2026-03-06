require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'careershield_secret_2024';

// Setup lowdb (JSON file database)
const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db = low(adapter);
db.defaults({ users: [], scans: [], contacts: [] }).write();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// ─────────────────────────────────────────────
// AUTH MIDDLEWARE
// ─────────────────────────────────────────────
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ message: 'Token is not valid' });
    }
}

// ─────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Please fill in all fields' });
        if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

        const existing = db.get('users').find({ email }).value();
        if (existing) return res.status(400).json({ message: 'Email already registered' });

        const hashed = await bcrypt.hash(password, 12);
        const user = { id: uuidv4(), name, email, password: hashed, createdAt: new Date().toISOString() };
        db.get('users').push(user).write();

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ message: 'Account created successfully', token, user: { id: user.id, name, email } });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Please enter email and password' });

        const user = db.get('users').find({ email }).value();
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─────────────────────────────────────────────
// SCAN ROUTES
// ─────────────────────────────────────────────

// POST /api/scans — Save scan result (protected)
app.post('/api/scans', authMiddleware, (req, res) => {
    try {
        const { type, input, riskScore, status } = req.body;
        if (!type || !input || riskScore === undefined || !status) {
            return res.status(400).json({ message: 'Missing required scan fields' });
        }
        const scan = { id: uuidv4(), userId: req.user.id, type, input, riskScore, status, createdAt: new Date().toISOString() };
        db.get('scans').push(scan).write();
        res.status(201).json({ message: 'Scan saved', scan });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/scans — Get all scans for user (protected)
app.get('/api/scans', authMiddleware, (req, res) => {
    try {
        const scans = db.get('scans')
            .filter({ userId: req.user.id })
            .sortBy('createdAt')
            .reverse()
            .value();
        res.json(scans);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/scans/stats — Summary counts (protected)
app.get('/api/scans/stats', authMiddleware, (req, res) => {
    try {
        const userScans = db.get('scans').filter({ userId: req.user.id }).value();
        const total = userScans.length;
        const safe = userScans.filter(s => s.status === 'Safe').length;
        const risk = userScans.filter(s => s.status === 'Medium Risk' || s.status === 'High Risk').length;
        res.json({ total, safe, risk });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─────────────────────────────────────────────
// CONTACT ROUTE
// ─────────────────────────────────────────────

// POST /api/contact
app.post('/api/contact', (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) return res.status(400).json({ message: 'Please fill in all fields' });
        db.get('contacts').push({ id: uuidv4(), name, email, message, createdAt: new Date().toISOString() }).write();
        res.json({ message: 'Message sent successfully! We will get back to you soon.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n✅ Career Shield Server Running!`);
    console.log(`🌐 Open your site: http://localhost:${PORT}`);
    console.log(`📁 Database: db.json (local file - no setup needed!)\n`);
});
