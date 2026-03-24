// backend/controllers/tpoController.js
const College = require('../models/College');
const notificationService = require('../services/notification.service');

const getConfig = async (req, res, next) => {
    try {
        const college = await College.findOne({ collegeId: req.user.collegeId });
        res.json(college ? college.settings : {});
    } catch (err) {
        next(err);
    }
};

const updateConfig = async (req, res, next) => {
    try {
        const college = await College.findOneAndUpdate(
            { collegeId: req.user.collegeId },
            { $set: { settings: req.body } },
            { new: true, upsert: true }
        );
        res.json(college.settings);
    } catch (err) {
        next(err);
    }
};

const sendBroadcast = async (req, res, next) => {
    try {
        const { targetAudience, title, message } = req.body;
        const Broadcast = require('../models/Broadcast');

        // 1. Persist for the Dashboard Banner
        const broadcast = new Broadcast({
            collegeId: req.user.collegeId,
            authorId: req.user.userId,
            title,
            message,
            targetAudience: targetAudience || 'All'
        });
        await broadcast.save();

        // 2. Send real-time notifications
        await notificationService.createAndSendNotification(
            req.user.collegeId,
            [], // All in college
            'BROADCAST',
            { title, message }
        );
        res.json({ message: 'Broadcast sent and persisted' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getConfig, updateConfig, sendBroadcast };
