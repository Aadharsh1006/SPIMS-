const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/rbacMiddleware');
const { tenantGuard } = require('../middleware/tenantMiddleware');

router.use(authMiddleware, tenantGuard());

router.get('/student', requireRoles('STUDENT'), analyticsController.getStudentDashboard);
router.get('/student/:studentId', requireRoles('FACULTY', 'TPO'), analyticsController.getStudentPerformance);
router.get('/tpo', requireRoles('TPO', 'SUPER_ADMIN'), analyticsController.getTpoAnalytics);
router.get('/skills/gap', requireRoles('STUDENT'), analyticsController.getSkillGapAnalytics);
router.get('/export/placements', requireRoles('TPO', 'SUPER_ADMIN'), analyticsController.exportPlacementData);

module.exports = router;
