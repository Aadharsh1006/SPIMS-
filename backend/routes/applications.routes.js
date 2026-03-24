const express = require('express');
const router = express.Router();
const applicationsController = require('../controllers/applicationsController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/rbacMiddleware');
const { tenantGuard } = require('../middleware/tenantMiddleware');

router.use(authMiddleware);

// Public student routes (no college context required in token for response)
router.get('/student/me', requireRoles('STUDENT'), applicationsController.getStudentApplications);
router.post('/:id/respond-to-offer', requireRoles('STUDENT'), applicationsController.respondToOffer);

// Protected routes (require college context check)
router.use(tenantGuard());

router.post('/:jobId/apply', requireRoles('STUDENT'), applicationsController.applyToJob);
router.post('/bulk-faculty-approve', requireRoles('FACULTY'), applicationsController.bulkFacultyApprove);
router.post('/:id/faculty-approve', requireRoles('FACULTY'), applicationsController.facultyApprove);
router.post('/:id/recruiter-shortlist', requireRoles('RECRUITER'), applicationsController.recruiterShortlist);
router.post('/:id/recruiter-offer', requireRoles('RECRUITER'), applicationsController.recruiterOffer);
router.post('/:id/recruiter-reject', requireRoles('RECRUITER'), applicationsController.recruiterReject);
router.post('/bulk-recruiter-action', requireRoles('RECRUITER'), applicationsController.bulkRecruiterAction);
router.post('/:id/recruiter-finalize', requireRoles('RECRUITER'), applicationsController.recruiterFinalize);

router.get('/college', requireRoles('FACULTY', 'TPO'), applicationsController.getCollegeApplications);
router.get('/job/:jobId', requireRoles('RECRUITER', 'TPO', 'FACULTY'), applicationsController.getJobApplicants);

module.exports = router;

