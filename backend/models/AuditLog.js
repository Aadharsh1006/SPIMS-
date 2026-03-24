const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String, // e.g., 'LOGIN', 'APP_STATUS_CHANGE', 'EXPORT_DATA'
        required: true
    },
    details: {
        type: Object,
        default: {}
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
