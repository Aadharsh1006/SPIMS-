// backend/models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
    {
        collegeId: { type: String, required: false, index: true },
        conversationType: {
            type: String,
            enum: [
                'TPO_STUDENT',
                'FACULTY_STUDENT',
                'RECRUITER_STUDENT',
                'ALUMNI_STUDENT',
                'ALUMNI_MENTORSHIP',
                'FACULTY_TPO',
                'RECRUITER_TPO',
                'RECRUITER_FACULTY',
                'ALUMNI_TPO',
                'FACULTY_ALUMNI',
                'SUPER_ADMIN_TPO',
                'SUPER_ADMIN_RECRUITER',
                'SUPER_ADMIN_ALUMNI'
            ],
            required: true
        },
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        encryptedPayload: { type: String, required: true },
        iv: { type: String, required: true },
        authTag: { type: String, required: true },
        sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        attachments: [{
            filename: String,
            url: String,
            fileType: String,
            size: Number
        }],
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    { timestamps: true }
);

MessageSchema.index({ collegeId: 1, participants: 1 });

module.exports = mongoose.model('Message', MessageSchema);
