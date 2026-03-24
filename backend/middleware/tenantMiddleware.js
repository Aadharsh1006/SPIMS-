// backend/middleware/tenantMiddleware.js
const tenantGuard = (allowSuperAdminBypass = true) => (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const userRole = (user.role || '').toUpperCase();
    if ((userRole === 'SUPER_ADMIN' && allowSuperAdminBypass) || userRole === 'RECRUITER' || userRole === 'ALUMNI') {
        return next();
    }

    if (!user.collegeId) {
        console.log(`[Tenant] Forbidden: User ${user.userId} has no collegeId`);
        return res.status(403).json({ message: 'No college context' });
    }

    const collegeIdParam = req.params.collegeId || req.body.collegeId;
    if (collegeIdParam && collegeIdParam !== user.collegeId) {
        console.log(`[Tenant] Forbidden: Params ${collegeIdParam} !== User ${user.collegeId}`);
        return res.status(403).json({ message: 'Cross-college access denied' });
    }

    req.collegeId = user.collegeId;
    next();
};

module.exports = { tenantGuard };
