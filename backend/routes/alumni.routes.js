const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/rbacMiddleware');
const { tenantGuard } = require('../middleware/tenantMiddleware');

router.use(authMiddleware);

router.post('/', requireRoles('TPO'), alumniController.createAlumni);
router.get('/search', alumniController.searchAlumni);
router.get('/job/:jobId/suggestions', tenantGuard(), requireRoles('STUDENT'), alumniController.getSuggestionsForJob);


module.exports = router;

