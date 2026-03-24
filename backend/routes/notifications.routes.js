const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/register-token', notificationsController.registerToken);
router.get('/', notificationsController.listNotifications);

router.patch('/read-all', notificationsController.markAllAsRead);
router.patch('/:id/read', notificationsController.markAsRead);

module.exports = router;
