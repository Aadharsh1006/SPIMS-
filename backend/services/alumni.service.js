// backend/services/alumni.service.js
const Alumni = require('../models/Alumni');
const User = require('../models/User');

const createOrVerifyAlumni = async (collegeId, userId, alumniPayload) => {
    // Ensure user role is updated to ALUMNI
    await User.findByIdAndUpdate(userId, { role: 'ALUMNI' });

    const alumni = new Alumni({
        ...alumniPayload,
        userId,
        collegeId
    });

    return await alumni.save();
};

const searchAlumni = async (collegeId, filters) => {
    const query = { collegeId, ...filters };
    return await Alumni.find(query).populate('userId', 'name email profile');
};

const getAlumniForJob = async (collegeId, company) => {
    return await Alumni.find({
        collegeId,
        company: { $regex: new RegExp(company, 'i') }
    }).populate('userId', 'name email profile');
};

module.exports = { createOrVerifyAlumni, searchAlumni, getAlumniForJob };

