// backend/services/messaging.service.js
const Message = require('../models/Message');
const { encryptMessage, decryptMessage } = require('../utils/crypto.utils');

const sendMessage = async (collegeId, senderId, conversationType, recipientIds, plaintext, attachments = []) => {
    // Simple key management (per-college or global for now)
    // Force key to 32 bytes to avoid RangeError: Invalid key length
    let key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
    if (key.length !== 32) {
        console.warn(`Messaging: Expected 32 byte key, got ${key.length}. Adjusting...`);
        const fixedKey = Buffer.alloc(32, 0);
        key.copy(fixedKey);
        key = fixedKey;
    }

    const { ciphertext, iv, authTag } = encryptMessage(plaintext, key);

    const newMessage = new Message({
        collegeId,
        sentBy: senderId,
        conversationType,
        participants: [senderId, ...recipientIds],
        encryptedPayload: ciphertext,
        iv,
        authTag,
        attachments
    });

    const savedMessage = await newMessage.save();

    // Trigger Notification
    try {
        const User = require('../models/User'); // Required for lookup in notification service if needed, though service does it
        const notificationService = require('./notification.service');
        const sender = await User.findById(senderId).select('name');

        await notificationService.createAndSendNotification(
            collegeId,
            recipientIds,
            'MESSAGE_RECEIVED',
            {
                title: 'New Message',
                body: `You received a message from ${sender?.name || 'a professional contact'}.`,
                messageId: savedMessage._id
            }
        );
    } catch (err) {
        console.error('Failed to trigger message notification:', err);
    }

    return savedMessage;
};

const getMessagesForConversation = async (userId, otherUserId, conversationType) => {
    const messages = await Message.find({
        conversationType,
        participants: { $all: [userId, otherUserId] }
    }).sort({ createdAt: 1 });

    // Force key to 32 bytes to avoid RangeError: Invalid key length
    let key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
    if (key.length !== 32) {
        const fixedKey = Buffer.alloc(32, 0);
        key.copy(fixedKey);
        key = fixedKey;
    }

    return messages.map(m => {
        try {
            const plaintext = decryptMessage(m.encryptedPayload, m.iv, m.authTag, key);
            return { ...m.toObject(), plaintext };
        } catch (e) {
            return { ...m.toObject(), plaintext: '[Decryption Error]' };
        }
    });
};


const getRecentConversations = async (userId) => {
    // Find unique conversations where userId is a participant
    const messages = await Message.find({
        participants: userId
    })
        .sort({ createdAt: -1 })
        .populate('participants', 'name email role _id collegeId profile');

    const conversations = [];
    const seenUsers = new Set();
    seenUsers.add(userId.toString());

    for (const msg of messages) {
        const otherParticipant = msg.participants.find(p => p && p._id.toString() !== userId.toString());
        if (otherParticipant && !seenUsers.has(otherParticipant._id.toString())) {
            seenUsers.add(otherParticipant._id.toString());
            conversations.push({
                otherUser: otherParticipant,
                lastMessage: msg,
                type: msg.conversationType
            });
        }
    }

    return conversations;
};

module.exports = { sendMessage, getMessagesForConversation, getRecentConversations };
