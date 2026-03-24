const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const College = require('../models/College');
const User = require('../models/User');

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
};

const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

const signUserToken = (user) => {
    const payload = {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
        collegeId: user.collegeId || null
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const signResetToken = (email) => {
    return jwt.sign({ email, type: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const verifyResetToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== 'reset') return null;
        return decoded.email;
    } catch (err) {
        return null;
    }
};

const registerUser = async (userData) => {
    const { email, password, role, collegeId, name, profile } = userData;
    
    // Defense-in-depth: only allow these roles to self-register
    const allowedRoles = ['RECRUITER', 'ALUMNI'];
    if (!allowedRoles.includes(role?.toUpperCase())) {
        throw new Error('Unauthorized role for self-registration. Please contact TPO.');
    }

    // Validate college domain if collegeId provided
    if (collegeId && role !== 'RECRUITER' && role !== 'SUPER_ADMIN' && role !== 'ALUMNI') {
        const college = await College.findOne({ collegeId });
        if (!college) {
            throw new Error('College not found');
        }
        if (!email.endsWith(`@${college.domain}`)) {
            throw new Error(`Invalid email domain. Must end with @${college.domain}`);
        }
    }

    const user = new User({
        email,
        password,
        role: role.toUpperCase(),
        name: name || email.split('@')[0],
        collegeId: collegeId || null,
        isActive: false, // All public registrations are inactive by default
        profile: profile || {}
    });
    await user.save();
    return user;
};

module.exports = { signUserToken, hashPassword, verifyPassword, registerUser, signResetToken, verifyResetToken };
