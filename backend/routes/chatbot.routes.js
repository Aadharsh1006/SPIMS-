// backend/routes/chatbot.routes.js
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { aiRateLimiter } = require('../middleware/rateLimiter');

router.post('/', authMiddleware, aiRateLimiter, chatbotController.getChatbotReply);

module.exports = router;
