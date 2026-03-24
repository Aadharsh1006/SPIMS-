const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authService = require('../services/auth.service');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const validate = require('../middleware/validate.middleware');
const { loginSchema, registerSchema, changePasswordSchema, forgotPasswordSchema, verifyOTPSchema, resetPasswordSchema } = require('../validators/authValidators');

router.post('/login', validate(loginSchema), async (req, res) => {
    try {
        const { email, password, role, collegeId } = req.body;

        // 1. Super Admin special case
        const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || '').split(',');
        if (superAdminEmails.includes(email) && password === process.env.SUPER_ADMIN_PASSWORD) {
            const fakeUser = { _id: 'superadmin', email, role: 'SUPER_ADMIN', collegeId: null };
            const token = jwt.sign({
                sub: fakeUser._id,
                email: fakeUser.email,
                role: fakeUser.role,
                collegeId: fakeUser.collegeId
            }, process.env.JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token, user: fakeUser });
        }

        // 2. Regular User Login
        const user = await User.findOne({ email }).select('+password');
        if (!user || !user.password || !(await authService.verifyPassword(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 3. Role and College Validation
        if (role && user.role !== role.toUpperCase()) {
            return res.status(401).json({ message: `Access denied: Account registered as ${user.role}` });
        }

        if (collegeId && ['STUDENT', 'FACULTY', 'TPO'].includes(user.role)) {
            if (user.collegeId !== collegeId) {
                return res.status(401).json({ message: `Access denied: Account not associated with ${collegeId}` });
            }
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account is pending approval by the administrator' });
        }

        const token = authService.signUserToken(user);
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                collegeId: user.collegeId,
                mustChangePassword: user.mustChangePassword
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/register', validate(registerSchema), async (req, res) => {
    try {
        const user = await authService.registerUser(req.body);

        if (!user.isActive) {
            return res.status(201).json({
                message: 'Registration successful! Your account is pending approval.',
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            });
        }

        const token = authService.signUserToken(user);
        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                collegeId: user.collegeId
            }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/dev-login', authController.devLogin);
router.get('/me', authMiddleware, authController.getMe);

router.post('/change-password', authMiddleware, validate(changePasswordSchema), authController.changePassword);

router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/verify-otp', validate(verifyOTPSchema), authController.verifyOTP);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;

