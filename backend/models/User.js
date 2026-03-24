const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
    {
        collegeId: { type: String, index: true },  // null for SUPER_ADMIN
        email: { type: String, required: true, index: true },
        password: { type: String, select: false },
        googleId: { type: String, index: true },

        name: { type: String, required: true },
        role: {
            type: String,
            enum: ['SUPER_ADMIN', 'TPO', 'FACULTY', 'STUDENT', 'RECRUITER', 'ALUMNI'],
            required: true
        },
        profile: {
            department: String,
            year: Number,
            section: String,
            rollNumber: String,
            cgpa: Number,
            skills: [String],
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
            atsScore: { type: Number, default: 0 },
            atsBreakdown: {
                impact: { score: Number, feedback: String },
                brevity: { score: Number, feedback: String },
                structure: { score: Number, feedback: String },
                grammar: { score: Number, feedback: String }
            },
            profileStrength: { type: Number, default: 0 },
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
            assignedFacultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            company: String,  // recruiter / alumni
            position: String,
            linkedinUrl: String,
            githubUrl: String,
            bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
        },
        deviceTokens: [String],
        mustChangePassword: { type: Boolean, default: false },
        isActive: { type: Boolean, default: false },
        resetPasswordOTP: { type: String, select: false },
        resetPasswordExpires: { type: Date, select: false }
    },
    { timestamps: true }
);

UserSchema.index({ collegeId: 1, role: 1 });
UserSchema.index({ collegeId: 1, email: 1 }, { unique: true });
UserSchema.index({ collegeId: 1, 'profile.assignedFacultyId': 1 });

UserSchema.pre('save', async function () {
    if (this.isModified('role') && this.role) {
        this.role = this.role.toUpperCase();
    }

    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});


UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

