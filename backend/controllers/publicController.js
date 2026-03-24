// backend/controllers/publicController.js
const User = require('../models/User');
const Resume = require('../models/Resume');
const StudentProfile = require('../models/StudentProfile');

const getPublicPortfolio = async (req, res, next) => {
    try {
        const { studentId } = req.params;

        // Fetch user data (excluding sensitive fields like password, deviceTokens, etc.)
        const user = await User.findOne({ _id: studentId, role: 'STUDENT', isActive: true })
            .select('name email profile.department profile.year profile.skills profile.experience profile.education profile.projects profile.achievements profile.linkedinUrl profile.githubUrl profile.bio');

        if (!user) {
            return res.status(404).json({ message: 'Public portfolio not found or unavailable' });
        }

        // Fetch latest resume to allow downloading PDF or viewing raw text
        const latestResume = await Resume.findOne({ studentId }).sort({ version: -1 }).select('_id storageUrl fileName');

        res.json({
            user,
            resume: latestResume ? { _id: latestResume._id, fileName: latestResume.fileName, storageUrl: latestResume.storageUrl } : null
        });
    } catch (err) {
        next(err);
    }
};

const downloadResume = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const latestResume = await Resume.findOne({ studentId }).sort({ version: -1 });

        if (!latestResume || !latestResume.storageUrl) {
            return res.status(404).json({ message: 'No professional dossier available for this node.' });
        }

        const path = require('path');
        const fs = require('fs');
        const rootDir = path.join(__dirname, '..');
        const filePath = path.join(rootDir, latestResume.storageUrl);

        if (fs.existsSync(filePath)) {
            res.download(filePath, latestResume.fileName || `resume_${studentId}.pdf`);
        } else {
            res.status(404).json({ message: 'Dossier file missing from neural storage.' });
        }
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getPublicPortfolio,
    downloadResume
};
