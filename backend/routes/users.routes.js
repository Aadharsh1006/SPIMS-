const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { tenantGuard } = require('../middleware/tenantMiddleware');

router.use(authMiddleware, tenantGuard());

router.get('/me', usersController.getMe);
router.patch('/me', usersController.updateProfile);
router.get('/staff', usersController.getStaff);
router.get('/broadcasts', usersController.getBroadcasts);

module.exports = router;
