const Job = require('../models/Job');
const User = require('../models/User');
const Resume = require('../models/Resume');
const Application = require('../models/Application');
const { computeStudentJobMatch } = require('./aiMatching.service');


const createJob = async (recruiterId, collegeId, jobPayload) => {
    const job = new Job({
        ...jobPayload,
        recruiterId,
        collegeId,
        status: 'PUBLISHED'
    });
    const savedJob = await job.save();

    // Notify Students of new job
    const studentIds = await User.find({ collegeId, role: 'STUDENT', isActive: true }).distinct('_id');
    if (studentIds.length > 0) {
        const notificationService = require('./notification.service');
        await notificationService.createAndSendNotification(
            collegeId,
            studentIds,
            'NEW_JOB_AVAILABLE',
            { title: 'New Job Opportunity', body: `${savedJob.company} is hiring for ${savedJob.title}!` }
        );
    }

    return savedJob;
};

const listJobsForUser = async (user) => {
    const { role, collegeId, userId } = user;

    if (role === 'RECRUITER') {
        return await Job.find({ recruiterId: userId });
    }

    if (role === 'STUDENT' || role === 'FACULTY' || role === 'TPO') {
        const query = {
            $or: [
                { collegeId: collegeId },
                {
                    'accessByColleges.collegeId': collegeId,
                    'accessByColleges.status': 'APPROVED'
                }
            ],
            status: 'PUBLISHED'
        };

        const availableJobs = await Job.find(query);

        if (role === 'STUDENT') {
            const studentUser = await User.findById(userId);
            if (!studentUser) return [];

            const studentProfile = studentUser.profile || {};
            const cgpa = studentProfile.cgpa || 0;
            const branch = studentProfile.department;
            const year = studentProfile.year;

            const latestResume = await Resume.findOne({ studentId: userId, collegeId }).sort({ version: -1 });
            const myApplications = await Application.find({ studentId: userId, collegeId }).distinct('jobId');

            const filteredAndMatched = await Promise.all(availableJobs.filter(job => {
                const req = job.requirements || {};

                // 1. CGPA check
                if (req.minCgpa && cgpa < req.minCgpa) return false;

                // 2. Branch check
                if (req.branchesAllowed && req.branchesAllowed.length > 0) {
                    if (!branch || !req.branchesAllowed.includes(branch)) return false;
                }

                // 3. Batch/Year check
                if (req.batchYear && year !== req.batchYear) return false;

                return true;
            }).map(async job => {
                const jobObj = job.toObject();
                jobObj.hasApplied = myApplications.some(appId => appId.toString() === job._id.toString());

                if (latestResume) {
                    const match = await computeStudentJobMatch(studentUser, latestResume, job);
                    return { ...jobObj, aiMatch: match };
                }
                return { ...jobObj, aiMatch: { matchPercentage: 0, explanation: 'Upload resume for AI matching' } };
            }));

            return filteredAndMatched.sort((a, b) => b.aiMatch.matchPercentage - a.aiMatch.matchPercentage);
        }

        return availableJobs;
    }


    return [];
};

const requestJobAccess = async (jobId, collegeId) => {
    return await Job.updateOne(
        { _id: jobId },
        {
            $addToSet: {
                accessByColleges: { collegeId, status: 'REQUESTED' }
            }
        }
    );
};

const approveJobAccess = async (jobId, recruiterId, targetCollegeId) => {
    const result = await Job.updateOne(
        { _id: jobId, recruiterId, 'accessByColleges.collegeId': targetCollegeId },
        { $set: { 'accessByColleges.$.status': 'APPROVED' } }
    );

    if (result.modifiedCount > 0) {
        const job = await Job.findById(jobId);
        const studentIds = await User.find({ collegeId: targetCollegeId, role: 'STUDENT' }).distinct('_id');
        if (studentIds.length > 0) {
            const notificationService = require('./notification.service');
            await notificationService.createAndSendNotification(
                targetCollegeId,
                studentIds,
                'NEW_JOB_AVAILABLE',
                { title: 'New Job Opportunity', body: `${job.company} is hiring for ${job.title}!` }
            );
        }
    }
    return result;
};


const getTpoJobs = async (collegeId) => {
    return await Job.find({
        $or: [
            { collegeId: collegeId },
            { 
                'accessByColleges.collegeId': collegeId, 
                'accessByColleges.status': 'APPROVED' 
            }
        ],
        status: 'PUBLISHED'
    }).sort({ createdAt: -1 });
};

const listGlobalJobsForTpo = async (collegeId) => {
    // Return jobs from other recruiters/colleges that haven't been requested or approved by this college
    return await Job.find({
        collegeId: { $ne: collegeId },
        status: 'PUBLISHED',
        'accessByColleges.collegeId': { $ne: collegeId }
    }).sort({ createdAt: -1 });
};

const getJobAccessRequests = async (recruiterId) => {
    // Return all jobs for this recruiter that have pending requests
    const jobs = await Job.find({
        recruiterId,
        'accessByColleges.status': 'REQUESTED'
    }).sort({ updatedAt: -1 });

    // Format for easier UI consumption: { jobId, jobTitle, company, requests: [{ collegeId, status }] }
    return jobs.map(job => ({
        jobId: job._id,
        title: job.title,
        company: job.company,
        requests: job.accessByColleges.filter(r => r.status === 'REQUESTED')
    }));
};

const updateJobStatus = async (jobId, status) => {
    return await Job.findByIdAndUpdate(jobId, { status }, { new: true });
};

const getJobById = async (jobId) => {
    return await Job.findById(jobId).populate('recruiterId', 'name email');
};

const updateJob = async (jobId, recruiterId, updatePayload) => {
    return await Job.findOneAndUpdate(
        { _id: jobId, recruiterId },
        { $set: updatePayload },
        { new: true }
    );
};

const deleteJob = async (jobId, recruiterId) => {
    return await Job.findOneAndDelete({ _id: jobId, recruiterId });
};

module.exports = {
    createJob,
    listJobsForUser,
    requestJobAccess,
    approveJobAccess,
    getTpoJobs,
    listGlobalJobsForTpo,
    getJobAccessRequests,
    updateJobStatus,
    getJobById,
    updateJob,
    deleteJob
};
