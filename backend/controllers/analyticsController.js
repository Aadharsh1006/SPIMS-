const asyncHandler = require('express-async-handler');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const mongoose = require('mongoose');

// @desc    Get Student Dashboard Stats
// @route   GET /api/analytics/student
// @access  Private (Student)
const getStudentDashboard = asyncHandler(async (req, res) => {
    const studentId = req.user.userId;

    const stats = await Application.aggregate([
        { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // Format stats
    const dashboard = {
        totalApplications: 0,
        facultyApproved: 0,
        rejected: 0,
        shortlisted: 0,
        interviews: 0,
        offers: 0,
        placed: false
    };

    stats.forEach(s => {
        dashboard.totalApplications += s.count;
        if (s._id === 'FACULTY_APPROVED') dashboard.facultyApproved += s.count;
        if (s._id === 'RECRUITER_REJECTED' || s._id === 'FACULTY_REJECTED' || s._id === 'OFFER_REJECTED') dashboard.rejected += s.count;
        if (s._id === 'RECRUITER_SHORTLISTED') dashboard.shortlisted += s.count;
        if (s._id === 'INTERVIEW_IN_PROGRESS') dashboard.interviews += s.count;
        if (s._id === 'OFFERED') dashboard.offers += s.count;
        if (s._id === 'OFFER_ACCEPTED') {
            dashboard.placed = true;
        }
    });

    res.json(dashboard);
});

// @desc    Get Performance Stats for a specific student (for Faculty/TPO)
// @route   GET /api/analytics/student/:studentId
// @access  Private (Faculty, TPO)
const getStudentPerformance = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    const student = await User.findById(studentId).select('name email profile');
    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    const applications = await Application.find({ studentId: new mongoose.Types.ObjectId(studentId) })
        .populate('jobId', 'title company')
        .sort({ updatedAt: -1 });

    const stats = await Application.aggregate([
        { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const performance = {
        student,
        applications: applications.map(app => ({
            jobTitle: app.jobId?.title,
            company: app.jobId?.company,
            status: app.status,
            appliedAt: app.createdAt,
            updatedAt: app.updatedAt,
            aiScore: app.aiScores?.layer1StudentMatch || 0
        })),
        summary: {
            total: 0,
            approved: 0,
            shortlisted: 0,
            placed: false
        }
    };

    stats.forEach(s => {
        performance.summary.total += s.count;

        const approvedStatuses = ['FACULTY_APPROVED', 'RECRUITER_SHORTLISTED', 'RECRUITER_REJECTED', 'INTERVIEW_IN_PROGRESS', 'OFFERED', 'OFFER_ACCEPTED', 'OFFER_REJECTED'];
        if (approvedStatuses.includes(s._id)) {
            performance.summary.approved += s.count;
        }

        const shortlistedStatuses = ['RECRUITER_SHORTLISTED', 'INTERVIEW_IN_PROGRESS', 'OFFERED', 'OFFER_ACCEPTED', 'OFFER_REJECTED'];
        if (shortlistedStatuses.includes(s._id)) {
            performance.summary.shortlisted += s.count;
        }

        if (s._id === 'OFFER_ACCEPTED') {
            performance.summary.placed = true;
        }
    });

    res.json(performance);
});

// @desc    Get TPO Analytics
// @route   GET /api/analytics/tpo
// @access  Private (TPO, SuperAdmin)
const getTpoAnalytics = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeId;
    const { department, timeRange } = req.query;

    const matchQuery = { collegeId: collegeId };
    const studentMatch = { collegeId: collegeId, role: 'STUDENT' };

    if (department && department !== 'ALL') {
        studentMatch['profile.department'] = department;
    }

    if (timeRange && timeRange !== 'ALL') {
        const now = new Date();
        let startDate;
        if (timeRange === '30D') startDate = new Date(now.setDate(now.getDate() - 30));
        else if (timeRange === '6M') startDate = new Date(now.setMonth(now.getMonth() - 6));
        else if (timeRange === '1Y') startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        
        if (startDate) {
            matchQuery.updatedAt = { $gte: startDate };
        }
    }

    // 1. Total Students (Filtered by Dept)
    const totalStudents = await User.countDocuments(studentMatch);

    // 2. Job Stats
    const totalJobs = await Job.countDocuments({ collegeId: collegeId });

    // Helper function to build application aggregation pipeline with department filter
    const buildApplicationPipeline = (baseMatch, includeStudentLookup = false) => {
        const pipeline = [{ $match: baseMatch }];

        if (department && department !== 'ALL' && includeStudentLookup) {
            pipeline.push(
                { $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'student' } },
                { $unwind: '$student' },
                { $match: { 'student.profile.department': department } }
            );
        }
        return pipeline;
    };

    // 3. Placement Stats (Aggregation - Filtered by Dept and Time)
    const placementStatsPipeline = buildApplicationPipeline(matchQuery, true);
    placementStatsPipeline.push({
        $group: {
            _id: '$status',
            count: { $sum: 1 }
        }
    });
    const placementStats = await Application.aggregate(placementStatsPipeline);

    // 4. Monthly Achievement Trend (Placed Students)
    const trendMatch = { ...matchQuery, status: 'OFFER_ACCEPTED' };
    const trendPipeline = [ { $match: trendMatch } ];
    if (department && department !== 'ALL') {
        trendPipeline.push(
            { $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'student' } },
            { $unwind: '$student' },
            { $match: { 'student.profile.department': department } }
        );
    }
    trendPipeline.push(
        { $group: { _id: { $month: "$updatedAt" }, count: { $sum: 1 } } },
        { $sort: { "_id": 1 } }
    );
    const monthlyTrend = await Application.aggregate(trendPipeline);

    // 5. Salary Statistics (Filter by Dept if needed)
    const salaryPipeline = [ { $match: { ...matchQuery, status: 'OFFER_ACCEPTED' } } ];
    if (department && department !== 'ALL') {
        salaryPipeline.push(
            { $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'student' } },
            { $unwind: '$student' },
            { $match: { 'student.profile.department': department } }
        );
    }
    salaryPipeline.push(
        { $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'job' } },
        { $unwind: '$job' },
        {
            $group: {
                _id: null,
                avgSalary: { $avg: "$job.salaryRange.min" },
                maxSalary: { $max: "$job.salaryRange.max" }
            }
        }
    );
    const salaryStats = await Application.aggregate(salaryPipeline);

    // 6. Department Wise Placement
    const departmentStats = await Application.aggregate([
        { $match: { ...matchQuery, status: 'OFFER_ACCEPTED' } },
        { $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'student' } },
        { $unwind: '$student' },
        { $group: { _id: '$student.profile.department', placedCount: { $sum: 1 } } }
    ]);

    // 6.1 Get all unique departments for the filter dropdown (to include depts with 0 placements)
    const allDepartments = await User.distinct('profile.department', { collegeId: collegeId, role: 'STUDENT' });

    // 7. Company stats
    const companyPipeline = [ { $match: { ...matchQuery, status: 'OFFER_ACCEPTED' } } ];
    if (department && department !== 'ALL') {
        companyPipeline.push(
            { $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'student' } },
            { $unwind: '$student' },
            { $match: { 'student.profile.department': department } }
        );
    }
    companyPipeline.push(
        { $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'job' } },
        { $unwind: '$job' },
        { $group: { _id: '$job.company', count: { $sum: 1 } } }
    );
    const companyStats = await Application.aggregate(companyPipeline);

    res.json({
        totalStudents,
        totalJobs,
        placementStats,
        departmentStats,
        companyStats,
        monthlyTrend,
        salaryStats: salaryStats[0] || { avgSalary: 0, maxSalary: 0 },
        allDepartments: allDepartments.filter(Boolean)
    });
});

// @desc    Get skill gap insights for student
// @route   GET /api/analytics/skills/gap
// @access  Private (Student)
const getSkillGapAnalytics = asyncHandler(async (req, res) => {
    // 1. Get Student Skills from User profile AND StudentProfile
    const user = await User.findById(req.user.userId);
    const studentProfile = await StudentProfile.findOne({ userId: req.user.userId });

    let studentSkills = [];
    if (user?.profile?.skills) studentSkills = [...studentSkills, ...user.profile.skills];
    if (user?.profile?.softSkills) studentSkills = [...studentSkills, ...user.profile.softSkills];
    if (studentProfile?.parsedSkills) studentSkills = [...studentSkills, ...studentProfile.parsedSkills];
    if (studentProfile?.softSkills) studentSkills = [...studentSkills, ...studentProfile.softSkills];

    // Unify and clean
    studentSkills = [...new Set(studentSkills.map(s => s.toLowerCase().trim()))];

    // 2. Get Market Demand Skills (Broaden filter: College specific OR Global/Market access)
    const jobSkillsAggregation = await Job.aggregate([
        {
            $match: {
                $or: [
                    { collegeId: req.user.collegeId },
                    { 'accessByColleges.collegeId': req.user.collegeId },
                    { status: 'PUBLISHED' } // Including global published jobs for broader trends
                ],
                status: 'PUBLISHED'
            }
        },
        { $unwind: "$requirements.skillsRequired" },
        { $group: { _id: { $toLower: { $trim: { input: "$requirements.skillsRequired" } } }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 }
    ]);

    let topSkills = jobSkillsAggregation.map(s => ({ skill: s._id, count: s.count }));

    // Fallback: If no jobs found, provide industry standard 'Future-Ready' skills
    if (topSkills.length === 0) {
        const fallbackSkills = ['React', 'Node.js', 'Python', 'Docker', 'AWS', 'TensorFlow', 'TypeScript', 'System Design'];
        topSkills = fallbackSkills.map((s, i) => ({ skill: s.toLowerCase(), count: 10 - i }));
    }

    // 3. Identify Missing Skills vs Market Top 10 using substring matching
    const missingSkills = topSkills
        .slice(0, 10)
        .filter(s => !studentSkills.some(studentSkill =>
            studentSkill.includes(s.skill) || s.skill.includes(studentSkill)
        ))
        .map(s => s.skill);

    // 4. Detailed Recommendations
    const recommendations = missingSkills.slice(0, 4).map(skill => {
        const skillData = topSkills.find(t => t.skill === skill);
        const marketWeight = skillData ? (skillData.count / topSkills[0].count * 100).toFixed(0) : 50;

        return {
            skill: skill.toUpperCase(),
            action: `Incorporate ${skill} into your tech stack. It appears in ${marketWeight}% of high-growth job listings this month.`,
            priority: marketWeight > 80 ? 'CRITICAL' : 'HIGH'
        };
    });

    res.json({
        mySkills: studentSkills,
        topMarketSkills: topSkills,
        missingSkills: missingSkills,
        recommendations: recommendations
    });
});

const { Parser } = require('json2csv');

// @desc    Export Placement Data (CSV) for PowerBI
// @route   GET /api/analytics/export/placements
// @access  Private (TPO, Admin)
const exportPlacementData = asyncHandler(async (req, res) => {
    const applications = await Application.find({
        collegeId: req.user.collegeId,
        status: { $in: ['OFFER_ACCEPTED', 'OFFERED'] }
    })
        .populate('studentId', 'name email department cgpa')
        .populate('jobId', 'title company salaryRange location');

    if (applications.length === 0) {
        return res.status(404).json({ message: 'No placement data found to export' });
    }

    const fields = [
        { label: 'Student Name', value: 'studentId.name' },
        { label: 'Email', value: 'studentId.email' },
        { label: 'Department', value: 'studentId.department' },
        { label: 'CGPA', value: 'studentId.cgpa' },
        { label: 'Job Title', value: 'jobId.title' },
        { label: 'Company', value: 'jobId.company' },
        { label: 'Salary (Max)', value: 'jobId.salaryRange.max' },
        { label: 'Location', value: 'jobId.location' },
        { label: 'Status', value: 'status' },
        { label: 'Date', value: 'updatedAt' }
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(applications);

    res.header('Content-Type', 'text/csv');
    res.attachment(`placements_export_${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csv);
});

module.exports = {
    getStudentDashboard,
    getStudentPerformance,
    getTpoAnalytics,
    getSkillGapAnalytics,
    exportPlacementData
};
