// backend/models/Alumni.js
const mongoose = require('mongoose');

const AlumniSchema = new mongoose.Schema(
    {
        collegeId: { type: String, required: true, index: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        company: { type: String, required: true },
        position: String,
        yearOfPassing: Number,
        skills: [String],
        willingToMentor: { type: Boolean, default: false }
    },
    { timestamps: true }
);

AlumniSchema.index({ collegeId: 1, company: 1 });

module.exports = mongoose.model('Alumni', AlumniSchema);
