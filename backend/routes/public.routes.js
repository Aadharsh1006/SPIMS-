// backend/routes/public.routes.js
const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Public route for fetching a student's portfolio
router.get('/portfolio/:studentId', publicController.getPublicPortfolio);
router.get('/portfolio/:studentId/resume/download', publicController.downloadResume);

module.exports = router;
