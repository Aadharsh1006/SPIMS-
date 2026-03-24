const AuditLog = require('../models/AuditLog');

const logAudit = async (req, action, details = {}) => {
    try {
        if (!req.user) return; // Only log authenticated actions or handle login separately

        await AuditLog.create({
            userId: req.user._id,
            action,
            details,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
        // Don't block execution if logging fails
    }
};

module.exports = { logAudit };
