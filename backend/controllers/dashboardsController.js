// backend/controllers/dashboardsController.js
const dashboardService = require('../services/dashboard.service');

const getStudentDashboard = async (req, res, next) => {
    try {
        const data = await dashboardService.getStudentDashboard(req.user.userId, req.user.collegeId);
        res.json(data);
    } catch (err) {
        next(err);
    }
};

const getTpoDashboard = async (req, res, next) => {
    try {
        const data = await dashboardService.getTpoDashboard(req.user.collegeId);
        res.json(data);
    } catch (err) {
        next(err);
    }
};

const { Parser } = require('json2csv');

const getFacultyDashboard = async (req, res, next) => {
    try {
        const rawData = await dashboardService.getFacultyDashboard(req.user);

        // Transform to match FacultyDashboard.jsx expectations
        const formattedData = {
            assignedStudents: rawData.assignedStudentCount,
            pendingApprovals: rawData.pendingApplicationsCount,
            completedReviews: rawData.shortlistedCount,
            totalEndorsements: rawData.placedStudentCount,
            timeline: rawData.timeline,
            cohortRadar: rawData.cohortRadar,
            endorsementRates: rawData.endorsementRates
        };

        res.json(formattedData);
    } catch (err) {
        next(err);
    }
};

const exportTpoData = async (req, res, next) => {
    try {
        const data = await dashboardService.getTpoExportData(req.user.collegeId);

        // Flatten data for CSV
        const flattened = data.map(app => ({
            StudentName: app.studentId?.name,
            StudentEmail: app.studentId?.email,
            RollNumber: app.studentId?.profile?.rollNumber,
            Department: app.studentId?.profile?.department,
            CGPA: app.studentId?.profile?.cgpa,
            JobTitle: app.jobId?.title,
            Company: app.jobId?.company,
            Status: app.status,
            MatchScore: app.aiScores?.layer1StudentMatch,
            ATSScore: app.aiScores?.atsScore,
            QualificationScore: app.aiScores?.layer2FacultyQualification,
            RecruiterRank: app.aiScores?.layer3RecruiterRank,
            AppliedDate: app.createdAt
        }));

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(flattened);

        res.header('Content-Type', 'text/csv');
        res.attachment(`placements_${req.user.collegeId}.csv`);
        res.send(csv);
    } catch (err) {
        next(err);
    }
};

const getRecruiterDashboard = async (req, res, next) => {
    try {
        const rawData = await dashboardService.getRecruiterDashboard(req.user.userId);

        // Transform to match RecruiterDashboard.jsx expectations
        const formattedData = {
            activeJobs: rawData.activeJobs,
            totalCandidates: rawData.totalCandidates,
            pendingApprovals: rawData.pendingReview,
            shortlistedCount: rawData.shortlistedCount,
            avgCTC: rawData.avgCTC || 0,
            highestCTC: rawData.highestCTC || 0,
            recentApplicants: (rawData.recentApplicants || []).map(app => ({
                studentName: app.studentId?.name,
                jobTitle: app.jobId?.title,
                appliedAt: app.updatedAt,
                // Pass the full aiScores object so the frontend cascade works:
                // app.aiScores?.layer3RecruiterRank || app.aiScores?.layer1StudentMatch || 0
                aiScores: {
                    layer3RecruiterRank: app.aiScores?.layer3RecruiterRank || 0,
                    layer1StudentMatch: app.aiScores?.layer1StudentMatch || 0,
                    atsScore: app.aiScores?.atsScore || 0
                }
            }))
        };

        res.json(formattedData);
    } catch (err) {
        next(err);
    }
};

module.exports = { getStudentDashboard, getTpoDashboard, getFacultyDashboard, exportTpoData, getRecruiterDashboard };


