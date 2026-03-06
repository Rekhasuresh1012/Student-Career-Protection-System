const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Simple schema inline for contact messages
const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

// POST /api/contact
router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        await Contact.create({ name, email, message });
        res.json({ message: 'Message sent successfully! We will get back to you soon.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
