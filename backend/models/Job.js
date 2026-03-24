// backend/models/Job.js
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
    {
        collegeId: { type: String, index: true }, // owning college (optional for global roles)
        recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: String,
        company: String,
        location: String,
        type: { type: String, enum: ['FULL_TIME', 'INTERNSHIP'], required: true },
        description: String,
        requirements: {
            minCgpa: Number,
            branchesAllowed: [String],
            skillsRequired: [String],
            batchYear: Number
        },
        salaryRange: {
            min: Number,
            max: Number,
            currency: { type: String, default: 'INR' }
        },
        status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'CLOSED'], default: 'DRAFT' },
        accessByColleges: [
            {
                collegeId: String,
                status: { type: String, enum: ['REQUESTED', 'APPROVED', 'REJECTED'] }
            }
        ]
    },
    { timestamps: true }
);

JobSchema.index({ collegeId: 1, status: 1 });
JobSchema.index({ 'accessByColleges.collegeId': 1 });

module.exports = mongoose.model('Job', JobSchema);
