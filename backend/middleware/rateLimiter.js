const rateLimit = require('express-rate-limit');

// Rate limiter specifically for heavy AI operations (Gemini / Python interactions)
const aiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 AI requests per 15 minutes
    message: {
        message: 'Too many requests to the AI engine from this IP. Please try again after 15 minutes.',
        error: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { aiRateLimiter };
