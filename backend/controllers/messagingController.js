// backend/controllers/messagingController.js
const messagingService = require('../services/messaging.service');
const { canMessage } = require('./usersController');
const User = require('../models/User');

const send = async (req, res, next) => {
    try {
        const { conversationType, recipientIds, plaintext, attachments } = req.body;

        // Safety check for all recipients
        for (const recipientId of recipientIds) {
            const recipient = await User.findById(recipientId);
            if (!recipient || !(await canMessage(req.user, recipient))) {
                return res.status(403).json({ message: 'Messaging restricted: Professional relationship not active.' });
            }
        }

        // Resolve collegeId
        let resolvedCollegeId = req.user.collegeId;
        if (!resolvedCollegeId && recipientIds.length > 0) {
            const firstRecipient = await User.findById(recipientIds[0]);
            resolvedCollegeId = firstRecipient?.collegeId;
        }

        const message = await messagingService.sendMessage(
            resolvedCollegeId,
            req.user.userId, // This is current logged in user
            conversationType,
            recipientIds,
            plaintext,
            attachments
        );
        res.status(201).json(message);
    } catch (err) {
        next(err);
    }
};

const uploadAttachment = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return attachment metadata for the frontend to include in the message send
        const attachment = {
            filename: req.file.originalname,
            url: `/uploads/attachments/${req.file.filename}`,
            fileType: req.file.mimetype,
            size: req.file.size
        };

        res.status(200).json(attachment);
    } catch (err) {
        next(err);
    }
};

const getHistory = async (req, res, next) => {
    try {
        const { userId, type } = req.params;

        // Visibility check
        const otherUser = await User.findById(userId);
        if (!otherUser || !(await canMessage(req.user, otherUser))) {
            return res.json([]); // Return empty history if relationship is broken
        }

        const messages = await messagingService.getMessagesForConversation(
            req.user.userId,
            userId,
            type
        );
        res.json(messages);
    } catch (err) {
        next(err);
    }
};


const getRecentConversations = async (req, res, next) => {
    try {
        const conversations = await messagingService.getRecentConversations(req.user.userId);

        // Async filter to check visibility for each conversation participant
        const filtered = [];
        for (const conv of conversations) {
            if (await canMessage(req.user, conv.otherUser)) {
                filtered.push(conv);
            }
        }

        res.json(filtered);
    } catch (err) {
        next(err);
    }
};

module.exports = { send, getHistory, getRecentConversations, uploadAttachment };
