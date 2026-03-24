const mongoose = require('mongoose');

const broadcastSchema = mongoose.Schema({
    collegeId: {
        type: String,
        ref: 'College',
        required: false
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    targetAudience: {
        type: String,
        enum: ['All', 'STUDENT', 'FACULTY', 'RECRUITER', 'ALUMNI', 'TPO', 'SUPER_ADMIN'],
        default: 'All'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Broadcast', broadcastSchema);
