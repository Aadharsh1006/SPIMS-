const alumniService = require('../services/alumni.service');
const Job = require('../models/Job');
const Application = require('../models/Application');

const getSuggestionsForJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const { collegeId } = req.user;

        const job = await Job.findOne({
            _id: jobId,
            $or: [
                { collegeId },
                { 'accessByColleges.collegeId': collegeId, 'accessByColleges.status': 'APPROVED' }
            ]
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found or not accessible' });
        }

        const alumni = await alumniService.getAlumniForJob(collegeId, job.company);
        res.json(alumni);
    } catch (err) {
        next(err);
    }
};

const searchAlumni = async (req, res, next) => {
    try {
        const alumni = await alumniService.searchAlumni(req.user.collegeId, req.query);
        res.json(alumni);
    } catch (err) {
        next(err);
    }
};

const createAlumni = async (req, res, next) => {
    try {
        const alumni = await alumniService.createOrVerifyAlumni(req.user.collegeId, req.user.userId, req.body);
        res.status(201).json(alumni);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getSuggestionsForJob,
    searchAlumni,
    createAlumni
};
