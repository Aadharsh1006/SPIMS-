const mongoose = require('mongoose');

const studentProfileSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    collegeId: {
        type: String,
        required: true,
        index: true
    },
    department: {
        type: String, // e.g. CSE, ECE
        index: true
    },
    resumeUrl: {
        type: String // Path to uploaded file
    },
    linkedinUrl: {
        type: String
    },
    githubUrl: {
        type: String
    },
    parsedSkills: [{
        type: String
    }],
    experience: [{
        title: String,
        company: String,
        duration: String,
        description: String
    }],
    education: [{
        degree: String,
        institution: String,
        year: String,
        grade: String
    }],
    atsScore: {
        type: Number,
        default: 0
    },
    atsBreakdown: {
        impact: { score: Number, feedback: String },
        brevity: { score: Number, feedback: String },
        structure: { score: Number, feedback: String },
        grammar: { score: Number, feedback: String }
    },
    profileStrength: {
        type: Number,
        default: 0
    },
    scoreReasoning: String,
    recruiterPitch: String,
    careerPaths: [String],
    projects: [{
        title: String,
        description: String,
        technologies: [String],
        link: String,
        aiAudit: {
            isVerified: Boolean,
            verificationToken: String,
            complexityScore: Number,
            feedback: String
        }
    }],
    achievements: [String],
    bio: String,
    certifications: [String],
    softSkills: [String],
    interests: [String],
    embedding: {
        type: [Number],
        index: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
