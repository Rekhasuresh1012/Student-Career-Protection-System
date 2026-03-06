const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Job Link', 'Job Description', 'Email', 'Company', 'Offer Letter'],
        required: true
    },
    input: {
        type: String,
        required: true,
        trim: true
    },
    riskScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    status: {
        type: String,
        enum: ['Safe', 'Medium Risk', 'High Risk'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Scan', scanSchema);
