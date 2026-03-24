// backend/models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
    {
        collegeId: { type: String, required: true, index: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        type: {
            type: String,
            enum: [
                'JOB_POSTED',
                'APPLICATION_SUBMITTED',
                'STATUS_UPDATED',
                'INTERVIEW_SCHEDULED',
                'MESSAGE_RECEIVED',
                'NEW_JOB_AVAILABLE',
                'NEW_APPLICATION',
                'APPLICATION_APPROVED',
                'NEW_APPLICANT',
                'SHORTLIST_UPDATE',
                'JOB_OFFER',
                'OFFER_FINALIZED',
                'BROADCAST'
            ],
            required: true
        },
        payload: { type: mongoose.Schema.Types.Mixed },
        isRead: { type: Boolean, default: false }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
