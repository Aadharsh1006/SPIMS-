const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobsController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/rbacMiddleware');
const { tenantGuard } = require('../middleware/tenantMiddleware');
const validate = require('../middleware/validate.middleware');
const { jobSchema } = require('../validators/jobValidators');

router.use(authMiddleware, tenantGuard());

router.post('/', requireRoles('RECRUITER'), validate(jobSchema), jobsController.createJob);
router.get('/', jobsController.listJobs);
router.post('/:id/request-access', requireRoles('TPO'), jobsController.requestAccess);
router.post('/:id/approve-access/:collegeId', requireRoles('RECRUITER'), jobsController.approveAccess);

router.get('/tpo/list', requireRoles('TPO', 'FACULTY'), jobsController.listTpoJobs);
router.get('/requests', requireRoles('RECRUITER'), jobsController.getAccessRequests);
router.get('/global', requireRoles('TPO'), jobsController.getGlobalJobs);
router.patch('/:id/publish', requireRoles('TPO'), jobsController.publishJob);
router.put('/:id', requireRoles('RECRUITER'), validate(jobSchema), jobsController.updateJob);
router.delete('/:id', requireRoles('RECRUITER'), jobsController.deleteJob);

module.exports = router;

