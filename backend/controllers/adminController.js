// backend/controllers/adminController.js
const College = require('../models/College');
const User = require('../models/User');

const createCollege = async (req, res, next) => {
    try {
        const college = new College(req.body);
        await college.save();
        res.status(201).json(college);
    } catch (err) {
        next(err);
    }
};

const getColleges = async (req, res, next) => {
    try {
        const colleges = await College.find();
        res.json(colleges);
    } catch (err) {
        next(err);
    }
};

const getPublicColleges = async (req, res, next) => {
    try {
        const colleges = await College.find({}, 'name collegeId domain');
        res.json(colleges);
    } catch (err) {
        next(err);
    }
};

const createTpo = async (req, res, next) => {
    try {
        const { collegeId, email, password, name } = req.body;

        const authService = require('../services/auth.service');
        const user = await authService.registerUser({
            email,
            password: 'password123',
            role: 'TPO',
            collegeId,
            name
        });

        user.mustChangePassword = true;
        await user.save();

        await College.findOneAndUpdate({ collegeId }, { tpoUserId: user._id });

        res.status(201).json({ message: 'TPO created and assigned successfully', user });
    } catch (err) {
        next(err);
    }
};

const assignTpo = async (req, res, next) => {
    try {
        const { id } = req.params; // college mongodb _id or collegeId
        const { userId } = req.body;

        const college = await College.findOne({ $or: [{ _id: id }, { collegeId: id }] });
        if (!college) return res.status(404).json({ message: 'College not found' });

        await College.findByIdAndUpdate(college._id, { tpoUserId: userId });
        await User.findByIdAndUpdate(userId, { role: 'TPO', collegeId: college.collegeId });

        res.json({ message: 'TPO assigned successfully' });
    } catch (err) {
        next(err);
    }
};

const updateCollege = async (req, res, next) => {
    try {
        const { id } = req.params;
        const college = await College.findOneAndUpdate(
            { $or: [{ _id: id }, { collegeId: id }] },
            { $set: req.body },
            { new: true }
        );
        if (!college) return res.status(404).json({ message: 'College not found' });
        res.json(college);
    } catch (err) {
        next(err);
    }
};

const deleteCollege = async (req, res, next) => {
    try {
        const { id } = req.params;
        const college = await College.findOne({ $or: [{ _id: id }, { collegeId: id }] });
        if (!college) return res.status(404).json({ message: 'College not found' });

        // Deactivate all users in this college
        await User.updateMany({ collegeId: college.collegeId }, { $set: { isActive: false } });

        await College.deleteOne({ _id: college._id });
        res.json({ message: 'College deleted and associated users deactivated' });
    } catch (err) {
        next(err);
    }
};

const deleteTpo = async (req, res, next) => {
    try {
        const { id, userId } = req.params; // collegeId and userId
        const college = await College.findOne({ collegeId: id });
        if (!college) return res.status(404).json({ message: 'College not found' });

        if (college.tpoUserId === userId) {
            await College.findByIdAndUpdate(college._id, { $unset: { tpoUserId: "" } });
        }

        await User.findByIdAndUpdate(userId, {
            $set: { role: 'STUDENT', collegeId: id } // Demote to student or make inactive
        });

        res.json({ message: 'TPO removed and demoted successfully' });
    } catch (err) {
        next(err);
    }
};

const getPendingRecruiters = async (req, res, next) => {
    try {
        const recruiters = await User.find({ role: 'RECRUITER', isActive: false }).select('-password');
        res.json(recruiters);
    } catch (err) {
        next(err);
    }
};

const approveRecruiter = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, { $set: { isActive: true } }, { new: true });
        if (!user) return res.status(404).json({ message: 'Recruiter not found' });
        res.json({ message: 'Recruiter approved successfully', user });
    } catch (err) {
        next(err);
    }
};

const sendGlobalBroadcast = async (req, res, next) => {
    try {
        const { title, message, targetAudience } = req.body;
        const Broadcast = require('../models/Broadcast');
        const notificationService = require('../services/notification.service');
        
        const broadcast = new Broadcast({
            collegeId: null, // Global
            authorId: req.user.userId,
            title,
            message,
            targetAudience: targetAudience || 'All'
        });

        await broadcast.save();

        // Send to ALL users globally
        await notificationService.createAndSendNotification(
            null, // Global
            [], // All active users
            'SYSTEM_BROADCAST',
            { title, message }
        );

        res.status(201).json(broadcast);
    } catch (err) {
        next(err);
    }
};

const getAdminAnalytics = async (req, res, next) => {
    try {
        const totalColleges = await College.countDocuments();
        const totalTPOs = await User.countDocuments({ role: 'TPO' });
        const totalRecruiters = await User.countDocuments({ role: 'RECRUITER' });
        const pendingRecruiters = await User.countDocuments({ role: 'RECRUITER', isActive: false });
        const totalStudents = await User.countDocuments({ role: 'STUDENT' });

        // College registration trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const collegeTrend = await College.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // User role distribution
        const roleDistribution = await User.aggregate([
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            stats: {
                totalColleges,
                totalTPOs,
                totalRecruiters,
                pendingRecruiters,
                totalStudents
            },
            collegeTrend,
            roleDistribution
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createCollege,
    getColleges,
    assignTpo,
    createTpo,
    updateCollege,
    deleteCollege,
    deleteTpo,
    getPendingRecruiters,
    approveRecruiter,
    getPublicColleges,
    sendGlobalBroadcast,
    getAdminAnalytics
};
