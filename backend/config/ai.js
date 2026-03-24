// backend/config/ai.js
module.exports = {
    SPACY_SERVICE_URL: process.env.SPACY_SERVICE_URL || 'http://127.0.0.1:8000',
    HF_SERVICE_URL: process.env.HF_SERVICE_URL || null // Placeholder for HuggingFace
};
