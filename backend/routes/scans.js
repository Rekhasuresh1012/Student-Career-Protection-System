const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');
const authMiddleware = require('../middleware/auth');

// POST /api/scans — Save a scan result (protected)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { type, input, riskScore, status } = req.body;

        if (!type || !input || riskScore === undefined || !status) {
            return res.status(400).json({ message: 'Missing required scan fields' });
        }

        const scan = await Scan.create({
            userId: req.user.id,
            type,
            input,
            riskScore,
            status
        });

        res.status(201).json({ message: 'Scan saved', scan });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/scans — Get all scans for logged-in user (protected)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const scans = await Scan.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(scans);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/scans/stats — Get summary counts (protected)
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const total = await Scan.countDocuments({ userId: req.user.id });
        const safe = await Scan.countDocuments({ userId: req.user.id, status: 'Safe' });
        const risk = await Scan.countDocuments({ userId: req.user.id, status: { $in: ['Medium Risk', 'High Risk'] } });

        res.json({ total, safe, risk });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
