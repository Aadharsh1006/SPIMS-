// backend/models/Resume.js
const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema(
    {
        collegeId: { type: String, required: true, index: true },
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        version: { type: Number, required: true },
        rawText: { type: String, required: true },
        parsed: {
            name: String,
            email: String,
            phone: String,
            education: [Object],
            experience: [Object],
            skills: [String],
            projects: [Object],
            certifications: [Object]
        },
        extractionMethod: { type: String, default: 'Unknown' },
        atsScore: { type: Number, default: 0 },
        atsBreakdown: {
            impact: { score: Number, feedback: String },
            brevity: { score: Number, feedback: String },
            structure: { score: Number, feedback: String },
            grammar: { score: Number, feedback: String }
        },
        vector: [Number],
        storageUrl: String,
        fileName: String
    },
    { timestamps: true }
);

ResumeSchema.index({ collegeId: 1, studentId: 1, version: -1 });

module.exports = mongoose.model('Resume', ResumeSchema);
