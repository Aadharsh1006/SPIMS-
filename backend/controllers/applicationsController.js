// backend/controllers/applicationsController.js
const applicationService = require('../services/application.service');
const Application = require('../models/Application');

const applyToJob = async (req, res, next) => {
    try {
        const application = await applicationService.oneClickApply(
            req.user,
            req.params.jobId,
            req.user.collegeId,
            req.body.customAiData
        );
        res.status(201).json(application);
    } catch (err) {
        next(err);
    }
};

const facultyApprove = async (req, res, next) => {
    try {
        const application = await applicationService.facultyApproveApplication(
            req.user,
            req.params.id,
            req.body.action // 'approve' or 'reject'
        );
        res.json(application);
    } catch (err) {
        next(err);
    }
};

const bulkFacultyApprove = async (req, res, next) => {
    try {
        const { applicationIds, action } = req.body;
        const results = await applicationService.bulkFacultyApproveApplication(
            req.user,
            applicationIds,
            action
        );
        res.json(results);
    } catch (err) {
        next(err);
    }
};

const recruiterShortlist = async (req, res, next) => {
    try {
        const application = await applicationService.recruiterShortlistApplication(req.user, req.params.id);
        res.json(application);
    } catch (err) {
        next(err);
    }
};

const recruiterOffer = async (req, res, next) => {
    try {
        const application = await applicationService.recruiterOfferApplication(req.user, req.params.id);
        res.json(application);
    } catch (err) {
        next(err);
    }
};

const recruiterFinalize = async (req, res, next) => {
    try {
        const application = await applicationService.recruiterFinalizeHire(req.user, req.params.id);
        res.json(application);
    } catch (err) {
        next(err);
    }
};

const respondToOffer = async (req, res, next) => {
    try {
        const application = await applicationService.studentDecision(
            req.user,
            req.params.id,
            req.body.decision // 'accept' or 'reject'
        );
        res.json(application);
    } catch (err) {
        next(err);
    }
};

const getStudentApplications = async (req, res, next) => {
    try {
        const applications = await Application.find({
            studentId: req.user.userId,
            collegeId: req.user.collegeId
        }).populate('jobId').lean();

        // Attach actual ATS score from student profile to each application for UI precision
        const User = require('../models/User');
        const user = await User.findById(req.user.userId);
        const atsScore = user?.profile?.atsScore || 0;

        const enrichedApplications = applications.map(app => ({
            ...app,
            studentAtsScore: atsScore
        }));

        res.json(enrichedApplications);
    } catch (err) {
        next(err);
    }
};

const getCollegeApplications = async (req, res, next) => {
    try {
        let applications;
        if (req.user.role === 'FACULTY') {
            applications = await applicationService.listApplicationsForFaculty(req.user);
        } else {
            applications = await applicationService.getCollegeApplications(
                req.user.collegeId,
                req.query.status
            );
        }
        res.json(applications);
    } catch (err) {
        next(err);
    }
};

const getJobApplicants = async (req, res, next) => {
    try {
        let applications;
        if (req.user.role === 'RECRUITER') {
            applications = await applicationService.listApplicationsForRecruiter(req.user, req.params.jobId);
        } else if (req.user.role === 'FACULTY' || req.user.role === 'TPO') {
            applications = await applicationService.getJobApplicantsForFaculty(req.user, req.params.jobId);
        } else {
            applications = await applicationService.getJobApplicants(req.params.jobId);
        }
        res.json(applications);
    } catch (err) {
        next(err);
    }
};

const recruiterReject = async (req, res, next) => {
    try {
        const application = await applicationService.recruiterRejectApplication(req.user, req.params.id);
        res.json(application);
    } catch (err) {
        next(err);
    }
};

const bulkRecruiterAction = async (req, res, next) => {
    try {
        const { applicationIds, action } = req.body;
        let results;
        if (action === 'shortlist') {
            results = await applicationService.bulkRecruiterShortlistApplication(req.user, applicationIds);
        } else if (action === 'offer') {
            results = await applicationService.bulkRecruiterOfferApplication(req.user, applicationIds);
        } else if (action === 'reject') {
            results = await applicationService.bulkRecruiterRejectApplication(req.user, applicationIds);
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }
        res.json(results);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    applyToJob,
    facultyApprove,
    bulkFacultyApprove,
    recruiterShortlist,
    recruiterOffer,
    recruiterReject,
    recruiterFinalize,
    bulkRecruiterAction,
    respondToOffer,
    getStudentApplications,
    getCollegeApplications,
    getJobApplicants
};

