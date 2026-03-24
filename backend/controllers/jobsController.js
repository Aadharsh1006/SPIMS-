// backend/controllers/jobsController.js
const jobService = require('../services/job.service');

const createJob = async (req, res, next) => {
    try {
        const job = await jobService.createJob(req.user.userId, req.user.collegeId, req.body);
        res.status(201).json(job);
    } catch (err) {
        next(err);
    }
};

const listJobs = async (req, res, next) => {
    try {
        const jobs = await jobService.listJobsForUser(req.user);
        res.json(jobs);
    } catch (err) {
        next(err);
    }
};

const requestAccess = async (req, res, next) => {
    try {
        await jobService.requestJobAccess(req.params.id, req.user.collegeId);
        res.json({ message: 'Access requested' });
    } catch (err) {
        next(err);
    }
};

const approveAccess = async (req, res, next) => {
    try {
        await jobService.approveJobAccess(req.params.id, req.user.userId, req.params.collegeId);
        res.json({ message: 'Access approved' });
    } catch (err) {
        next(err);
    }
};

const listTpoJobs = async (req, res, next) => {
    try {
        const jobs = await jobService.getTpoJobs(req.user.collegeId);
        res.json(jobs);
    } catch (err) {
        next(err);
    }
};

const getGlobalJobs = async (req, res, next) => {
    try {
        const jobs = await jobService.listGlobalJobsForTpo(req.user.collegeId);
        res.json(jobs);
    } catch (err) {
        next(err);
    }
};

const getAccessRequests = async (req, res, next) => {
    try {
        const requests = await jobService.getJobAccessRequests(req.user.userId);
        res.json(requests);
    } catch (err) {
        next(err);
    }
};

const publishJob = async (req, res, next) => {
    try {
        const job = await jobService.updateJobStatus(req.params.id, 'PUBLISHED');
        res.json(job);
    } catch (err) {
        next(err);
    }
};

const updateJob = async (req, res, next) => {
    try {
        const job = await jobService.updateJob(req.params.id, req.user.userId, req.body);
        if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });
        res.json(job);
    } catch (err) {
        next(err);
    }
};

const deleteJob = async (req, res, next) => {
    try {
        const job = await jobService.deleteJob(req.params.id, req.user.userId);
        if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });
        res.json({ message: 'Job deleted successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = { createJob, listJobs, requestAccess, approveAccess, listTpoJobs, getGlobalJobs, getAccessRequests, publishJob, updateJob, deleteJob };
