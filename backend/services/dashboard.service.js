const Application = require('../models/Application');
const User = require('../models/User');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const jobService = require('./job.service');
const { computeStudentJobMatch } = require('./aiMatching.service');


const getStudentDashboard = async (userId, collegeId) => {
    // 1. Basic Stats
    const totalApplications = await Application.countDocuments({ studentId: userId, collegeId });
    const shortlistedCount = await Application.countDocuments({
        studentId: userId,
        collegeId,
        status: { $in: ['RECRUITER_SHORTLISTED', 'OFFERED', 'OFFER_ACCEPTED', 'INTERVIEW_IN_PROGRESS'] }
    });
    const offersCount = await Application.countDocuments({
        studentId: userId,
        collegeId,
        status: { $in: ['OFFERED', 'OFFER_ACCEPTED', 'OFFER_REJECTED'] }
    });

    // 2. AI Recommendations
    const studentUser = await User.findById(userId);
    const availableJobs = await jobService.listJobsForUser(studentUser);
    const latestResume = await Resume.findOne({ studentId: userId, collegeId }).sort({ version: -1 });

    let recommendations = [];
    const myApplications = await Application.find({ studentId: userId, collegeId }).distinct('jobId');
    const appliedJobIds = myApplications.map(id => id.toString());

    if (availableJobs.length > 0) {
        const matches = await Promise.all(availableJobs
            .filter(job => !appliedJobIds.includes(job._id.toString())) // Filter out applied jobs
            .map(async job => {
                const match = await computeStudentJobMatch(studentUser, latestResume, job);
                return {
                    jobId: job._id,
                    title: job.title,
                    company: job.company,
                    ...match
                };
            }));

        // Top 5 sorted by matchPercentage
        recommendations = matches
            .sort((a, b) => b.matchPercentage - a.matchPercentage)
            .slice(0, 5);
    }

    const hasNoJobs = availableJobs.length === 0;
    const isCaughtUp = availableJobs.length > 0 && availableJobs.every(job => appliedJobIds.includes(job._id.toString()));

    // 3. Status & Timeline
    const apps = await Application.find({ studentId: userId, collegeId }).populate('jobId');

    const studentProfile = await require('../models/StudentProfile').findOne({ userId });

    // 5. Profile Strength Calculation
    // Use the maximum of profileStrength from User or StudentProfile
    let profileStrength = Math.max(
        studentUser.profile?.profileStrength || 0,
        studentProfile?.profileStrength || 0
    );
    
    const atsScore = latestResume?.atsScore || 0;
    
    // Comprehensive fallback calculation if stored values are 0
    if (profileStrength === 0) {
        const sections = [
            { met: !!(studentUser.profile?.department || studentProfile?.department), weight: 15 },
            { met: !!(studentUser.profile?.cgpa || studentProfile?.cgpa), weight: 15 },
            { met: ((studentUser.profile?.skills?.length > 0) || (studentProfile?.skills?.length > 0)), weight: 15 },
            { met: !!(studentUser.profile?.bio || studentProfile?.bio), weight: 15 },
            { met: ((studentUser.profile?.education?.length > 0) || (studentProfile?.education?.length > 0)), weight: 15 },
            { met: ((studentUser.profile?.projects?.length > 0) || (studentProfile?.projects?.length > 0)), weight: 15 },
            { met: !!latestResume, weight: 10 }
        ];
        profileStrength = Math.round(sections.reduce((acc, s) => acc + (s.met ? s.weight : 0), 0));
    }

    let placementStatus = 'Career Launching';
    const acceptedOffer = apps.find(a => a.status === 'OFFER_ACCEPTED');
    if (acceptedOffer) {
        placementStatus = `Placed at ${acceptedOffer.jobId.company}`;
    } else {
        const anyOffer = apps.find(a => a.status === 'OFFERED');
        if (anyOffer) {
            placementStatus = `Offer from ${anyOffer.jobId.company}`;
        } else {
            const interviewing = apps.find(a => a.status === 'INTERVIEW_IN_PROGRESS');
            if (interviewing) {
                placementStatus = `Interviewing with ${interviewing.jobId.company}`;
            } else {
                const shortlisted = apps.find(a => a.status === 'RECRUITER_SHORTLISTED');
                if (shortlisted) {
                    placementStatus = `Shortlisted by ${shortlisted.jobId.company}`;
                }
            }
        }
    }

    const timeline = [];
    const eventMaps = {
        'APPLIED': 'Application Submitted',
        'FACULTY_APPROVED': 'Approved by Faculty',
        'FACULTY_REJECTED': 'Changes requested by Faculty',
        'RECRUITER_SHORTLISTED': 'Shortlisted for Interview',
        'RECRUITER_REJECTED': 'Application Review Completed',
        'OFFERED': 'Offer Letter Released',
        'OFFER_ACCEPTED': 'Offer Accepted - Hired!',
        'OFFER_REJECTED': 'Offer Declined'
    };

    apps.forEach(app => {
        app.history.forEach(h => {
            timeline.push({
                date: h.timestamp,
                event: eventMaps[h.action] || h.action.replace(/_/g, ' '),
                company: app.jobId.company,
                notes: h.notes
            });
        });
    });
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
        userId: studentUser._id,
        name: studentUser.name,
        department: studentUser.profile?.department || studentProfile?.department || 'Not Set',
        cgpa: studentUser.profile?.cgpa || 0,
        totalApplications,
        shortlistedCount,
        offersCount,
        recommendations,
        placementStatus,
        profileStrength,
        atsScore,
        isCaughtUp,
        hasNoJobs,
        hasResume: !!latestResume,
        profile: studentUser.profile || studentProfile || {},
        timeline: timeline.slice(0, 10) // Latest 10 events
    };
};



const getFacultyDashboard = async (facultyUser) => {
    const { userId, collegeId } = facultyUser;

    const assignedStudentIds = await User.find({
        'profile.assignedFacultyId': userId,
        collegeId,
        role: 'STUDENT'
    }).distinct('_id');

    const assignedStudentCount = assignedStudentIds.length;

    const stats = await Application.aggregate([
        { $match: { studentId: { $in: assignedStudentIds }, collegeId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusCounts = {};
    stats.forEach(s => { statusCounts[s._id] = s.count; });

    const placedStudentCount = await Application.countDocuments({
        studentId: { $in: assignedStudentIds },
        collegeId,
        status: 'OFFER_ACCEPTED'
    });

    // 1. Timeline of recent events across assigned students
    const recentApps = await Application.find({ studentId: { $in: assignedStudentIds }, collegeId })
        .populate('jobId')
        .populate('studentId', 'name')
        .sort({ 'history.timestamp': -1 })
        .limit(20);

    const timeline = [];
    const eventMaps = {
        'APPLIED': 'Application Submitted',
        'FACULTY_APPROVED': 'Endorsed by You',
        'FACULTY_REJECTED': 'Updates Requested by You',
        'RECRUITER_SHORTLISTED': 'Shortlisted for Interview',
        'RECRUITER_REJECTED': 'Application Review Completed',
        'OFFERED': 'Offer Letter Released',
        'OFFER_ACCEPTED': 'Offer Accepted - Hired!',
        'OFFER_REJECTED': 'Offer Declined'
    };

    recentApps.forEach(app => {
        app.history.forEach(h => {
            timeline.push({
                date: h.timestamp,
                event: eventMaps[h.action] || h.action.replace(/_/g, ' '),
                studentName: app.studentId?.name || 'Unknown Student',
                company: app.jobId?.company || 'Unknown Company',
                notes: h.notes
            });
        });
    });
    // Sort and limit down to absolute most recent 15
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentTimeline = timeline.slice(0, 15);

    // 2. Cohort Analytics (Averages for Radar)
    const cohortScores = await Application.aggregate([
        { $match: { studentId: { $in: assignedStudentIds }, collegeId, 'aiScores': { $exists: true } } },
        {
            $group: {
                _id: null,
                avgSystemMatch: { $avg: '$aiScores.layer1StudentMatch' },
                avgATSScore: { $avg: '$aiScores.atsScore' },
                avgFacultyQual: { $avg: '$aiScores.layer2FacultyQualification' }
            }
        }
    ]);

    const cohortRadar = cohortScores.length > 0 ? {
        systemMatch: Math.round(cohortScores[0].avgSystemMatch || 0),
        atsScore: Math.round(cohortScores[0].avgATSScore || 0),
        facultyQual: Math.round(cohortScores[0].avgFacultyQual || 0)
    } : { systemMatch: 0, atsScore: 0, facultyQual: 0 };

    // 3. Endorsement Rates over time (Funnel Logic)
    let approved = 0;
    let pending = 0;
    let needsUpdates = 0;
    let shortlisted = 0;
    let offers = 0;

    stats.forEach(s => {
        if (s._id === 'FACULTY_PENDING') pending += s.count;
        if (s._id === 'FACULTY_REJECTED') needsUpdates += s.count;

        const approvedStatuses = ['FACULTY_APPROVED', 'RECRUITER_SHORTLISTED', 'RECRUITER_REJECTED', 'INTERVIEW_IN_PROGRESS', 'OFFERED', 'OFFER_ACCEPTED', 'OFFER_REJECTED'];
        if (approvedStatuses.includes(s._id)) {
            approved += s.count;
        }

        const shortlistedStatuses = ['RECRUITER_SHORTLISTED', 'INTERVIEW_IN_PROGRESS', 'OFFERED', 'OFFER_ACCEPTED', 'OFFER_REJECTED'];
        if (shortlistedStatuses.includes(s._id)) {
            shortlisted += s.count;
        }

        const offerStatuses = ['OFFERED', 'OFFER_ACCEPTED', 'OFFER_REJECTED'];
        if (offerStatuses.includes(s._id)) {
            offers += s.count;
        }
    });

    const endorsementRates = [
        { label: 'Pending', count: pending },
        { label: 'Endorsed', count: approved },
        { label: 'Needs Updates', count: needsUpdates }
    ];

    return {
        assignedStudentCount,
        placedStudentCount,
        pendingApplicationsCount: pending,
        shortlistedCount: shortlisted,
        offersCount: offers,
        timeline: recentTimeline,
        cohortRadar,
        endorsementRates
    };
};

const getTpoDashboard = async (collegeId) => {
    const studentCount = await User.countDocuments({ collegeId, role: 'STUDENT' });
    const facultyCount = await User.countDocuments({ collegeId, role: 'FACULTY' });

    const placedCount = await Application.countDocuments({ collegeId, status: 'OFFER_ACCEPTED' });
    const placementRate = studentCount > 0 ? (placedCount / studentCount) * 100 : 0;

    // Placements by Faculty (Populate names and departments)
    const placementsByFaculty = await Application.aggregate([
        { $match: { collegeId, status: 'OFFER_ACCEPTED' } },
        { $group: { _id: '$facultyId', placedCount: { $sum: 1 } } },
        { $sort: { placedCount: -1 } }
    ]);

    // Populate the faculty details manually since aggregate lookup can be complex
    const facultyDetails = await User.find({
        _id: { $in: placementsByFaculty.map(p => p._id).filter(id => !!id) }
    }).select('name profile.department');

    const facultyMap = {};
    facultyDetails.forEach(f => {
        facultyMap[f._id.toString()] = {
            name: f.name,
            department: f.profile?.department || 'General'
        };
    });

    const formattedPlacements = placementsByFaculty.map(p => {
        const info = facultyMap[p._id?.toString()] || { name: 'Direct/Unknown', department: 'General' };
        return {
            facultyId: p._id,
            facultyName: info.name,
            department: info.department,
            placedCount: p.placedCount
        };
    });

    // Companies by Hires
    const companiesByHires = await Application.aggregate([
        { $match: { collegeId, status: 'OFFER_ACCEPTED' } },
        { $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'job' } },
        { $unwind: '$job' },
        { $group: { _id: '$job.company', hiresCount: { $sum: 1 } } },
        { $sort: { hiresCount: -1 } }
    ]);

    // Cohort Quality Metrics (ATS and Match averages)
    const cohortQuality = await Application.aggregate([
        { $match: { collegeId } },
        {
            $group: {
                _id: null,
                avgATS: { $avg: '$aiScores.atsScore' },
                avgMatch: { $avg: '$aiScores.layer1StudentMatch' }
            }
        }
    ]);

    // Job Count
    const ownedJobs = await Job.countDocuments({ collegeId, status: 'PUBLISHED' });
    const approvedGlobalJobs = await Job.countDocuments({
        status: 'PUBLISHED',
        'accessByColleges': { $elemMatch: { collegeId, status: 'APPROVED' } }
    });
    const jobCount = ownedJobs + approvedGlobalJobs;

    return {
        studentCount,
        facultyCount,
        placedCount,
        jobCount,
        avgAtsScore: Math.round(cohortQuality[0]?.avgATS || 0),
        avgJobMatch: Math.round(cohortQuality[0]?.avgMatch || 0),
        placementRate: `${Math.round(placementRate)}%`,
        placementsByFaculty: formattedPlacements,
        companiesByHires: companiesByHires.map(c => ({
            company: c._id,
            hiresCount: c.hiresCount
        }))
    };
};

const getTpoExportData = async (collegeId) => {
    // Return aggregated data for CSV export
    return await Application.find({ collegeId })
        .populate('studentId', 'name email profile')
        .populate('jobId', 'title company')
        .lean();
};

const getRecruiterDashboard = async (recruiterId) => {
    // 1. Job Stats
    const totalJobs = await Job.countDocuments({ recruiterId });
    const activeJobs = await Job.countDocuments({ recruiterId, status: 'PUBLISHED' });

    // 2. Application Stats (Applications for jobs posted by this recruiter)
    // Find all job IDs for this recruiter
    const jobIds = await Job.find({ recruiterId }).distinct('_id');

    // Total candidates who applied to these jobs
    const totalCandidates = await Application.countDocuments({ jobId: { $in: jobIds } });

    // CTC Analytics (Only from accepted offers)
    const activePlacements = await Application.find({
        jobId: { $in: jobIds },
        status: 'OFFER_ACCEPTED'
    }).populate('jobId', 'salaryRange');

    let totalCTC = 0;
    let highestCTC = 0;
    activePlacements.forEach(app => {
        const salary = app.jobId?.salaryRange?.max || 0;
        totalCTC += salary;
        if (salary > highestCTC) highestCTC = salary;
    });
    const avgCTC = activePlacements.length > 0 ? (totalCTC / activePlacements.length).toFixed(1) : 0;

    // Pending review (Approved by Faculty but not yet shortlisted/rejected by recruiter)
    const pendingReview = await Application.countDocuments({
        jobId: { $in: jobIds },
        status: 'FACULTY_APPROVED'
    });

    // Shortlisted by recruiter
    const shortlistedCount = await Application.countDocuments({
        jobId: { $in: jobIds },
        status: { $in: ['RECRUITER_SHORTLISTED', 'OFFERED', 'OFFER_ACCEPTED'] }
    });

    // Latest applicants for dashboard preview
    const recentApplicants = await Application.find({ jobId: { $in: jobIds } })
        .populate('studentId', 'name email')
        .populate('jobId', 'title')
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean();

    return {
        totalJobs,
        activeJobs,
        totalCandidates,
        pendingReview,
        shortlistedCount,
        recentApplicants,
        avgCTC,
        highestCTC
    };
};

module.exports = { getStudentDashboard, getTpoDashboard, getFacultyDashboard, getTpoExportData, getRecruiterDashboard };



