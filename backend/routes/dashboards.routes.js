const express = require('express');
const router = express.Router();
const dashboardsController = require('../controllers/dashboardsController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/rbacMiddleware');
const { tenantGuard } = require('../middleware/tenantMiddleware');

router.use(authMiddleware, tenantGuard());

router.get('/student/me', requireRoles('STUDENT'), dashboardsController.getStudentDashboard);
router.get('/tpo/overview', requireRoles('TPO'), dashboardsController.getTpoDashboard);
router.get('/faculty/overview', requireRoles('FACULTY'), dashboardsController.getFacultyDashboard);
router.get('/recruiter/overview', requireRoles('RECRUITER'), dashboardsController.getRecruiterDashboard);
router.get('/tpo/export', requireRoles('TPO'), dashboardsController.exportTpoData);

module.exports = router;


