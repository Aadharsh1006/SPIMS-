const express = require('express');
const router = express.Router();
const collegeController = require('../controllers/collegeController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/rbacMiddleware');
const { tenantGuard } = require('../middleware/tenantMiddleware');

router.use(authMiddleware, requireRoles('TPO'), tenantGuard());

router.post('/import/students', collegeController.importStudents);
router.post('/import/faculties', collegeController.importFaculties);
router.post('/assign-faculty', collegeController.assignFaculty);

module.exports = router;
