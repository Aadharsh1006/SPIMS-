const Application = require('../models/Application');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const User = require('../models/User');
const College = require('../models/College');
const { computeStudentJobMatch } = require('./aiMatching.service');
const notificationService = require('./notification.service');
const recommendationService = require('./recommendationService');

const oneClickApply = async (studentUser, jobId, collegeId, customAiData = null) => {
    const job = await Job.findOne({
        _id: jobId,
        $or: [
            { collegeId: collegeId },
            { 'accessByColleges.collegeId': collegeId, 'accessByColleges.status': 'APPROVED' }
        ],
        status: 'PUBLISHED'
    });

    if (!job) {
        const error = new Error('Job not available or not found');
        error.statusCode = 404;
        throw error;
    }

    const latestResume = await Resume.findOne({ studentId: studentUser.userId, collegeId }).sort({ version: -1 });

    let layer1Score = 50;
    let aiExplanation = '';

    if (customAiData && typeof customAiData.matchScore === 'number') {
        layer1Score = customAiData.matchScore;
        aiExplanation = customAiData.fitReason || 'Custom LLM Analysis';
    } else {
        // Fallback to static compute function
        const match = await computeStudentJobMatch(studentUser, latestResume, job);
        layer1Score = match.matchPercentage;
        aiExplanation = match.explanation;
    }

    // Fetch full user to ensure profile data (atsScore) is available
    const fullStudent = await User.findById(studentUser.userId || studentUser._id);
    
    const application = new Application({
        collegeId,
        jobId,
        studentId: studentUser.userId || studentUser._id,
        resumeId: latestResume ? latestResume._id : null,
        status: 'FACULTY_PENDING',
        aiScores: {
            layer1StudentMatch: layer1Score,
            atsScore: fullStudent?.profile?.atsScore || 0, // Profile's true overall neural impact
            aiExplanation
        },
        history: [{
            actorRole: 'STUDENT',
            actorId: studentUser.userId,
            action: 'APPLIED',
            timestamp: new Date()
        }]
    });

    const savedApp = await application.save();

    // Notify Faculty
    const student = await User.findById(studentUser.userId);
    if (student.profile?.assignedFacultyId) {
        await notificationService.createAndSendNotification(
            collegeId,
            [student.profile.assignedFacultyId],
            'NEW_APPLICATION',
            { title: 'New Application', body: `${student.name} applied for ${job.title}` }
        );
    }

    return savedApp;
};

const listApplicationsForFaculty = async (facultyUser) => {
    const assignedStudentIds = await User.find({
        'profile.assignedFacultyId': facultyUser.userId,
        collegeId: facultyUser.collegeId,
        role: 'STUDENT'
    }).distinct('_id');

    const applications = await Application.find({
        studentId: { $in: assignedStudentIds },
        collegeId: facultyUser.collegeId,
        status: 'FACULTY_PENDING'
    }).populate('studentId resumeId jobId');

    for (const app of applications) {
        if (!app.aiScores.layer2FacultyQualification) {
            const rejectedCount = await Application.countDocuments({
                studentId: app.studentId._id,
                status: { $in: ['FACULTY_REJECTED', 'RECRUITER_REJECTED'] }
            });
            const l1 = app.aiScores.layer1StudentMatch || 50;
            const ats = app.aiScores.atsScore || 50;
            const penalty = Math.min(rejectedCount * 5, 20);
            app.aiScores.layer2FacultyQualification = Math.max(0, Math.round(((l1 + ats) / 2) - penalty));
            await app.save();
        }
    }
    return applications;
};

const facultyApproveApplication = async (facultyUser, applicationId, approveOrReject) => {
    const status = approveOrReject === 'approve' ? 'FACULTY_APPROVED' : 'FACULTY_REJECTED';
    const facultyId = facultyUser.userId;

    const app = await Application.findOneAndUpdate(
        { _id: applicationId, collegeId: facultyUser.collegeId },
        {
            $set: { status, facultyId },
            $push: {
                history: {
                    actorRole: 'FACULTY',
                    actorId: facultyId,
                    action: status,
                    timestamp: new Date()
                }
            }
        },
        { new: true }
    ).populate('studentId jobId');

    if (app) {
        if (status === 'FACULTY_APPROVED') {
            // Notify Student
            await notificationService.createAndSendNotification(
                app.collegeId,
                [app.studentId._id],
                'APPLICATION_APPROVED',
                { title: 'Application Approved', body: `Your application for ${app.jobId.title} was approved by faculty.` }
            );
            // Notify Recruiter
            await notificationService.createAndSendNotification(
                app.collegeId,
                [app.jobId.recruiterId],
                'NEW_APPLICANT',
                { title: 'New Approved Applicant', body: `A new student has been approved for ${app.jobId.title}` }
            );
        } else if (status === 'FACULTY_REJECTED') {
            // Notify Student of rejection
            await notificationService.createAndSendNotification(
                app.collegeId,
                [app.studentId._id],
                'STATUS_UPDATED',
                { title: 'Application Status Update', body: `Your application for ${app.jobId.title} was not approved by faculty.` }
            );
        }
    }

    return app;
};

const listApplicationsForRecruiter = async (recruiterUser, jobId) => {
    // Verify job belongs to recruiter
    const job = await Job.findOne({ _id: jobId, recruiterId: recruiterUser.userId });
    if (!job) {
        const error = new Error('Job not found or access denied');
        error.statusCode = 403;
        throw error;
    }

    const applications = await Application.find({
        jobId,
        status: { $in: ['FACULTY_APPROVED', 'RECRUITER_SHORTLISTED', 'RECRUITER_REJECTED', 'OFFERED', 'OFFER_ACCEPTED'] }
    }).populate('studentId resumeId');

    for (const app of applications) {
        if (!app.aiScores.layer3RecruiterRank) {
            const l1 = app.aiScores.layer1StudentMatch || 50;
            const l2 = app.aiScores.layer2FacultyQualification || 50;
            const ats = app.aiScores.atsScore || 50;
            app.aiScores.layer3RecruiterRank = Math.round((l1 * 0.3) + (l2 * 0.4) + (ats * 0.3));
            await app.save();
        }
    }

    return applications.sort((a, b) => b.aiScores.layer3RecruiterRank - a.aiScores.layer3RecruiterRank);
};

const recruiterShortlistApplication = async (recruiterUser, applicationId) => {
    const app = await Application.findById(applicationId).populate('jobId');
    if (!app) {
        const error = new Error('Application not found');
        error.statusCode = 404;
        throw error;
    }

    // Verify recruiter owns the job
    if (app.jobId.recruiterId.toString() !== recruiterUser.userId) {
        const error = new Error('Unauthorized shortlist action');
        error.statusCode = 403;
        throw error;
    }

    app.status = 'RECRUITER_SHORTLISTED';
    app.history.push({
        actorRole: 'RECRUITER',
        actorId: recruiterUser.userId,
        action: 'SHORTLISTED',
        timestamp: new Date()
    });

    await app.save();

    // Refresh population for studentId (needed for notifications)
    await app.populate('studentId');

    if (app) {
        await triggerShortlistNotifications(app);
    }
    return app;
};

const recruiterOfferApplication = async (recruiterUser, applicationId) => {
    const app = await Application.findById(applicationId).populate('jobId');
    if (!app) {
        const error = new Error('Application not found');
        error.statusCode = 404;
        throw error;
    }

    if (app.jobId.recruiterId.toString() !== recruiterUser.userId) {
        const error = new Error('Unauthorized offer action');
        error.statusCode = 403;
        throw error;
    }

    app.status = 'OFFERED';
    app.history.push({
        actorRole: 'RECRUITER',
        actorId: recruiterUser.userId,
        action: 'OFFER_EXTENDED',
        timestamp: new Date()
    });

    await app.save();
    await app.populate('studentId');

    await notificationService.createAndSendNotification(
        app.collegeId,
        [app.studentId._id],
        'JOB_OFFER',
        { title: 'Job Offer Received!', body: `Congratulations! ${app.jobId.company} has extended an offer for ${app.jobId.title}.` }
    );

    return app;
};

const recruiterFinalizeHire = async (recruiterUser, applicationId) => {
    const app = await Application.findById(applicationId).populate('jobId');
    if (!app) {
        const error = new Error('Application not found');
        error.statusCode = 404;
        throw error;
    }

    if (app.jobId.recruiterId.toString() !== recruiterUser.userId) {
        const error = new Error('Unauthorized hiring action');
        error.statusCode = 403;
        throw error;
    }

    app.status = 'OFFER_ACCEPTED';
    app.history.push({
        actorRole: 'RECRUITER',
        actorId: recruiterUser.userId,
        action: 'OFFER_ACCEPTED_BY_RECRUITER',
        timestamp: new Date()
    });

    await app.save();
    await app.populate('studentId');

    await notificationService.createAndSendNotification(
        app.collegeId,
        [app.studentId._id],
        'OFFER_FINALIZED',
        { title: 'Placement Finalized', body: `Your placement at ${app.jobId.company} is now officially recorded.` }
    );

    return app;
};

const studentDecision = async (studentUser, applicationId, decision) => {
    // decision: 'accept' or 'reject'
    const status = decision === 'accept' ? 'OFFER_ACCEPTED' : 'OFFER_REJECTED';

    const app = await Application.findOne({
        _id: applicationId,
        studentId: studentUser.userId
    }).populate('jobId');

    if (!app) {
        const error = new Error('Application not found or unauthorized');
        error.statusCode = 404;
        throw error;
    }

    if (app.status !== 'OFFERED') {
        const error = new Error('No active offer to respond to');
        error.statusCode = 400;
        throw error;
    }

    app.status = status;
    app.history.push({
        actorRole: 'STUDENT',
        actorId: studentUser.userId,
        action: status,
        timestamp: new Date()
    });

    await app.save();

    // Notify Recruiter
    await notificationService.createAndSendNotification(
        app.collegeId,
        [app.jobId.recruiterId],
        'STATUS_UPDATED',
        { title: `Offer ${decision === 'accept' ? 'Accepted' : 'Rejected'}`, body: `${studentUser.name} has ${decision === 'accept' ? 'accepted' : 'declined'} your offer for ${app.jobId.title}.` }
    );

    return app;
};

const triggerShortlistNotifications = async (app) => {
    const student = await User.findById(app.studentId._id);
    const facultyId = student.profile?.assignedFacultyId;
    const college = await College.findOne({ collegeId: app.collegeId });
    const tpoId = college?.tpoUserId;

    const userIds = [student._id];
    if (facultyId) userIds.push(facultyId);
    if (tpoId) userIds.push(tpoId);

    await notificationService.createAndSendNotification(
        app.collegeId,
        userIds,
        'SHORTLIST_UPDATE',
        { title: 'Student Shortlisted', body: `${student.name} shortlisted for ${app.jobId.title}` }
    );
};

const autoShortlistTopK = async (recruiterUser, jobId, k = 10) => {
    const apps = await listApplicationsForRecruiter(recruiterUser, jobId);
    const topK = apps.slice(0, k);

    for (const app of topK) {
        app.status = 'RECRUITER_SHORTLISTED';
        app.history.push({
            actorRole: 'RECRUITER',
            actorId: recruiterUser.userId,
            action: 'AI_SHORTLISTED',
            timestamp: new Date()
        });
        await app.save();
        await triggerShortlistNotifications(app);
    }
    return topK;
};

const getCollegeApplications = async (collegeId, status) => {
    const query = { collegeId };
    if (status) query.status = status;
    return await Application.find(query).populate('studentId jobId resumeId');
};

const getJobApplicants = async (jobId) => {
    // For recruiters, we show applicants who have passed faculty approval
    return await Application.find({
        jobId,
        status: { $in: ['FACULTY_APPROVED', 'RECRUITER_SHORTLISTED', 'RECRUITER_REJECTED', 'OFFERED', 'OFFER_ACCEPTED'] }
    }).populate('studentId resumeId');
};

const recruiterRejectApplication = async (recruiterUser, applicationId) => {
    const app = await Application.findById(applicationId).populate('jobId');
    if (!app) {
        const error = new Error('Application not found');
        error.statusCode = 404;
        throw error;
    }

    if (app.jobId.recruiterId.toString() !== recruiterUser.userId) {
        const error = new Error('Unauthorized reject action');
        error.statusCode = 403;
        throw error;
    }

    app.status = 'RECRUITER_REJECTED';
    app.history.push({
        actorRole: 'RECRUITER',
        actorId: recruiterUser.userId,
        action: 'REJECTED',
        timestamp: new Date()
    });

    await app.save();
    await app.populate('studentId');

    await notificationService.createAndSendNotification(
        app.collegeId,
        [app.studentId._id],
        'STATUS_UPDATED',
        { title: 'Application Status Update', body: `We regret to inform you that your application for ${app.jobId.title} at ${app.jobId.company} was not selected.` }
    );

    return app;
};

const bulkFacultyApproveApplication = async (facultyUser, applicationIds, approveOrReject) => {
    const results = [];
    for (const id of applicationIds) {
        try {
            const app = await facultyApproveApplication(facultyUser, id, approveOrReject);
            if (app) results.push(app);
        } catch (err) {
            console.error(`Bulk approval error for ${id}:`, err);
        }
    }
    return results;
};

const getJobApplicantsForFaculty = async (user, jobId) => {
    // For Faculty/TPO, show all applicants from their specific college
    return await Application.find({
        jobId,
        collegeId: user.collegeId
    })
    .populate('studentId')
    .populate('resumeId')
    .sort({ createdAt: -1 });
};

const bulkRecruiterShortlistApplication = async (recruiterUser, applicationIds) => {
    const results = [];
    for (const id of applicationIds) {
        try {
            const app = await recruiterShortlistApplication(recruiterUser, id);
            if (app) results.push(app);
        } catch (err) {
            console.error(`Bulk shortlist error for ${id}:`, err);
        }
    }
    return results;
};

const bulkRecruiterOfferApplication = async (recruiterUser, applicationIds) => {
    const results = [];
    for (const id of applicationIds) {
        try {
            const app = await recruiterOfferApplication(recruiterUser, id);
            if (app) results.push(app);
        } catch (err) {
            console.error(`Bulk offer error for ${id}:`, err);
        }
    }
    return results;
};

const bulkRecruiterRejectApplication = async (recruiterUser, applicationIds) => {
    const results = [];
    for (const id of applicationIds) {
        try {
            const app = await recruiterRejectApplication(recruiterUser, id);
            if (app) results.push(app);
        } catch (err) {
            console.error(`Bulk reject error for ${id}:`, err);
        }
    }
    return results;
};

module.exports = {
    oneClickApply,
    listApplicationsForFaculty,
    facultyApproveApplication,
    bulkFacultyApproveApplication,
    listApplicationsForRecruiter,
    recruiterShortlistApplication,
    recruiterOfferApplication,
    recruiterRejectApplication,
    recruiterFinalizeHire,
    studentDecision,
    autoShortlistTopK,
    getCollegeApplications,
    getJobApplicants,
    getJobApplicantsForFaculty,
    bulkRecruiterShortlistApplication,
    bulkRecruiterOfferApplication,
    bulkRecruiterRejectApplication
};
