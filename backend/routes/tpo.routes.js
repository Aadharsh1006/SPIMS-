// backend/routes/tpo.routes.js
const express = require('express');
const router = express.Router();
const tpoController = require('../controllers/tpoController');
const usersController = require('../controllers/usersController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/rbacMiddleware');
const { tenantGuard } = require('../middleware/tenantMiddleware');

// Base middleware for all TPO-mounted routes
router.use(authMiddleware, tenantGuard());

// Config & Broadcast (Strictly TPO)
router.get('/config', requireRoles('TPO'), tpoController.getConfig);
router.put('/config', requireRoles('TPO'), tpoController.updateConfig);
router.post('/broadcasts', requireRoles('TPO'), tpoController.sendBroadcast);

// Students Directory (Accessible by TPO, Faculty, and Alumni)
router.get('/students', requireRoles('TPO', 'FACULTY', 'ALUMNI'), usersController.getStudents);

// Verification & Bulk Actions (Strictly TPO)
router.patch('/students/:id/verify', requireRoles('TPO'), usersController.updateUserStatus);
router.post('/bulk-verify', requireRoles('TPO'), usersController.bulkUpdateUserStatus);

// Faculties (Strictly TPO)
router.get('/faculties', requireRoles('TPO'), usersController.getFaculties);
router.patch('/faculties/:id/verify', requireRoles('TPO'), usersController.updateUserStatus);

// Alumni Management (Strictly TPO)
router.get('/alumni', requireRoles('TPO'), usersController.getAlumni);
router.patch('/alumni/:id/verify', requireRoles('TPO'), usersController.updateUserStatus);

module.exports = router;
