// backend/models/Application.js
const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
    {
        collegeId: { type: String, required: true, index: true },
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
        status: {
            type: String,
            enum: [
                'FACULTY_PENDING',
                'FACULTY_APPROVED',
                'FACULTY_REJECTED',
                'RECRUITER_SHORTLISTED',
                'RECRUITER_REJECTED',
                'INTERVIEW_IN_PROGRESS',
                'OFFERED',
                'OFFER_ACCEPTED',
                'OFFER_REJECTED'
            ],
            default: 'FACULTY_PENDING'
        },
        interviewDetails: {
            date: Date,
            time: String,
            link: String,
            platform: String, // e.g., 'Zoom', 'Google Meet', 'In-Person'
            notes: String
        },
        offerLetterUrl: String,
        aiScores: {
            layer1StudentMatch: Number,
            layer2FacultyQualification: Number,
            layer3RecruiterRank: Number,
            atsScore: Number,
            aiExplanation: String
        },
        history: [
            {
                actorRole: String,
                actorId: mongoose.Schema.Types.ObjectId,
                action: String,
                timestamp: Date,
                notes: String
            }
        ]
    },
    { timestamps: true }
);

ApplicationSchema.index({ collegeId: 1, jobId: 1 });
ApplicationSchema.index({ collegeId: 1, studentId: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
