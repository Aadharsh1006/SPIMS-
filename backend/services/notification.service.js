// backend/services/notification.service.js
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendPushNotification } = require('../config/firebase');

const createAndSendNotification = async (collegeId, userIds, type, payload) => {
    let targetUserIds = userIds;

    // Handle Broadcast (if userIds is empty/null, send to all in college or global)
    if (!targetUserIds || targetUserIds.length === 0) {
        const query = { isActive: true };
        if (collegeId) {
            query.collegeId = collegeId;
        }
        targetUserIds = await User.find(query).distinct('_id');
    }

    if (!targetUserIds || targetUserIds.length === 0) return;

    const notifications = targetUserIds.map(userId => ({
        collegeId,
        userId,
        type,
        payload
    }));

    await Notification.insertMany(notifications);

    // FCM Logic
    const users = await User.find({ _id: { $in: targetUserIds } }).select('deviceTokens');
    const tokens = users.flatMap(u => u.deviceTokens || []);

    if (tokens.length > 0) {
        const title = payload.title || 'SPIMS+ Update';
        const body = payload.body || `New update for ${type.replace(/_/g, ' ')}`;
        await sendPushNotification(tokens, title, body, { type });
    }
};

module.exports = { createAndSendNotification };
