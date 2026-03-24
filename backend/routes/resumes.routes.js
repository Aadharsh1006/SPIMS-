const express = require('express');
const router = express.Router();
const multer = require('multer');
const resumesController = require('../controllers/resumesController');
const { authMiddleware } = require('../middleware/authMiddleware');

const uploadMiddleware = require('../middleware/uploadMiddleware');
const { aiRateLimiter } = require('../middleware/rateLimiter');

// Initialize upload middleware with memory storage for AI parsing
const upload = uploadMiddleware(true);

router.use(authMiddleware);

router.post('/upload', aiRateLimiter, upload.single('resume'), resumesController.uploadResumeFile);
router.post('/', resumesController.uploadResume);
router.get('/my', resumesController.getMyResumes);
router.get('/student/:studentId', resumesController.getResumeByStudentId);

module.exports = router;
