const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/rbacMiddleware');
const { tenantGuard } = require('../middleware/tenantMiddleware');

// Public routes for registration
router.get('/colleges/public', adminController.getPublicColleges);

router.use(authMiddleware, requireRoles('SUPER_ADMIN'), tenantGuard(true));

router.post('/colleges', adminController.createCollege);
router.get('/colleges', adminController.getColleges);
router.post('/colleges/create-tpo', adminController.createTpo);
router.post('/colleges/:id/tpo', adminController.assignTpo);

router.put('/colleges/:id', adminController.updateCollege);
router.delete('/colleges/:id', adminController.deleteCollege);
router.delete('/colleges/:id/tpo/:userId', adminController.deleteTpo);

router.get('/recruiters/pending', adminController.getPendingRecruiters);
router.patch('/recruiters/:id/approve', adminController.approveRecruiter);
router.get('/analytics', adminController.getAdminAnalytics);
router.post('/broadcasts', adminController.sendGlobalBroadcast);

module.exports = router;
