// backend/middleware/rbacMiddleware.js
const requireRoles = (...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const userRole = (req.user.role || '').toUpperCase();
    const allowedRoles = roles.map(r => r.toUpperCase());

    if (!allowedRoles.includes(userRole)) {
        console.log(`[RBAC] Forbidden: User role ${userRole} not in required roles ${roles}`);
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};

module.exports = { requireRoles };
