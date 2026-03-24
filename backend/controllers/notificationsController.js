// backend/controllers/notificationsController.js
const Notification = require('../models/Notification');
const User = require('../models/User');

const registerToken = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.userId, {
            $addToSet: { deviceTokens: req.body.token }
        });
        res.json({ message: 'Token registered' });
    } catch (err) {
        next(err);
    }
};

const listNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ userId: req.user.userId, collegeId: req.user.collegeId }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        next(err);
    }
};

const markAsRead = async (req, res, next) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { isRead: true }
        );
        res.json({ message: 'Marked as read' });
    } catch (err) {
        next(err);
    }
};

const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { userId: req.user.userId, isRead: false },
            { isRead: true }
        );
        res.json({ message: 'All marked as read' });
    } catch (err) {
        next(err);
    }
};

module.exports = { registerToken, listNotifications, markAsRead, markAllAsRead };
