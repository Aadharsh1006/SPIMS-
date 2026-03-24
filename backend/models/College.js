// backend/models/College.js
const mongoose = require('mongoose');

const CollegeSchema = new mongoose.Schema(
    {
        collegeId: { type: String, unique: true, index: true },
        name: { type: String, required: true },
        domain: { type: String, required: true, unique: true }, // email domain
        address: String,
        tpoUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        active: { type: Boolean, default: true },
        plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
        settings: {
            portalTitle: { type: String, default: 'Placement Portal' },
            themeColor: { type: String, default: '#0f172a' },
            allowStudentProfileEdit: { type: Boolean, default: true }
        }

    },
    { timestamps: true }
);

module.exports = mongoose.model('College', CollegeSchema);
