const authService = require('../services/auth.service');
const User = require('../models/User');
const mailService = require('../services/mail.service');

const devLogin = async (req, res, next) => {
    if (process.env.ALLOW_DEV_LOGIN !== 'true') {
        return res.status(403).json({ message: 'Dev login is disabled.' });
    }
    try {
        const { email, role, collegeId } = req.body;
        // ... existing devLogin logic ...
        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                email,
                name: email.split('@')[0],
                role,
                collegeId: collegeId || null,
                isActive: true
            });
            await user.save();
        } else {
            user.role = role;
            user.collegeId = collegeId || null;
            await user.save();
        }

        const token = authService.signUserToken(user);
        res.json({ token, user: { id: user._id, email: user.email, role: user.role, collegeId: user.collegeId } });
    } catch (err) {
        next(err);
    }
};

const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        next(err);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = newPassword;
        user.mustChangePassword = false;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        next(err);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        await mailService.sendOTP(email, otp);
        res.json({ message: 'OTP sent to email. Code: ' + (process.env.SMTP_USER === 'your_email@gmail.com' ? otp : 'SENT') });
    } catch (err) {
        next(err);
    }
};

const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email }).select('+resetPasswordOTP +resetPasswordExpires');
        
        if (!user || user.resetPasswordOTP !== otp || !user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const resetToken = authService.signResetToken(user.email);
        res.json({ resetToken });
    } catch (err) {
        next(err);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { resetToken, newPassword } = req.body;
        const email = authService.verifyResetToken(resetToken);
        
        if (!email) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = newPassword;
        user.mustChangePassword = false;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        next(err);
    }
};

module.exports = { devLogin, getMe, changePassword, forgotPassword, verifyOTP, resetPassword };

