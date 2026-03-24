const express = require('express');
const router = express.Router();
const messagingController = require('../controllers/messagingController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { tenantGuard } = require('../middleware/tenantMiddleware');
const createUpload = require('../middleware/uploadMiddleware');

const upload = createUpload(false); // file storage

router.use(authMiddleware, tenantGuard());

router.post('/upload', (req, res, next) => {
    req.uploadType = 'attachments';
    next();
}, upload.single('file'), messagingController.uploadAttachment);

router.post('/send', messagingController.send);
router.get('/conversations', messagingController.getRecentConversations);
router.get('/conversation/:userId/:type', messagingController.getHistory);

module.exports = router;

