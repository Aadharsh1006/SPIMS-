// backend/controllers/chatbotController.js
const User = require('../models/User');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Broadcast = require('../models/Broadcast');
const axios = require('axios');

const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:8000';

const getChatbotReply = async (req, res, next) => {
    try {
        const { query } = req.body;
        if (!query || !query.trim()) {
            return res.json({ reply: "Please ask me a question!", actions: [] });
        }

        const userId = req.user.userId;
        const userRole = req.user.role;
        const collegeId = req.user.collegeId;

        // ── 1. Fetch user profile ──
        const user = await User.findById(userId).select('name email role profile').lean();

        // ── 2. Fetch role-specific data ──
        let applications = [];
        let jobs = [];
        let broadcasts = [];

        if (userRole === 'STUDENT') {
            applications = await Application.find({ student: userId })
                .populate('job', 'title company type location')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();
            // Format for context
            applications = applications.map(a => ({
                jobTitle: a.job?.title || 'Untitled',
                companyName: a.job?.company || 'Unknown',
                status: a.status,
                appliedAt: a.createdAt
            }));

            jobs = await Job.find({ isActive: true })
                .select('title company type location')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

        } else if (userRole === 'RECRUITER') {
            jobs = await Job.find({ recruiterId: userId })
                .select('title company type applicants')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();
            jobs = jobs.map(j => ({
                title: j.title,
                company: j.company,
                type: j.type,
                applicantCount: j.applicants?.length || 0
            }));

        } else if (userRole === 'FACULTY') {
            // Faculty: show pending approvals count
            const pendingCount = await Application.countDocuments({ 
                facultyApproval: 'PENDING', 
                'student': { $exists: true } 
            });
            applications = [{ status: `${pendingCount} pending faculty approvals` }];

        } else if (userRole === 'TPO') {
            const studentCount = await User.countDocuments({ collegeId, role: 'STUDENT', isActive: true });
            const jobCount = await Job.countDocuments({ isActive: true });
            applications = [{ status: `Managing ${studentCount} students, ${jobCount} active jobs` }];
        }

        // ── 3. Fetch recent broadcasts ──
        try {
            broadcasts = await Broadcast.find({
                $or: [{ collegeId: null }, { collegeId: collegeId }]
            }).sort({ createdAt: -1 }).limit(3).lean();
        } catch (e) {
            broadcasts = [];
        }

        // ── 4. Build context and call AI ──
        const userContext = {
            name: user?.name || 'User',
            role: userRole,
            profile: user?.profile || {},
            applications,
            jobs,
            broadcasts
        };

        try {
            const aiResponse = await axios.post(`${AI_SERVER_URL}/api/ai/chatbot-query`, {
                question: query,
                userContext
            }, { timeout: 30000 });

            return res.json(aiResponse.data);
        } catch (aiError) {
            console.error('AI Server unreachable, using fallback:', aiError.message);
            
            // ── Fallback: Smart local response ──
            return res.json(generateFallbackReply(query, userContext));
        }

    } catch (err) {
        next(err);
    }
};

/**
 * Generates a local fallback reply when the AI server is unavailable.
 */
function generateFallbackReply(query, ctx) {
    const q = query.toLowerCase();
    const role = ctx.role;
    let reply = '';
    let actions = [];

    if (q.includes('application') || q.includes('status')) {
        if (role === 'STUDENT' && ctx.applications.length > 0) {
            const apps = ctx.applications;
            reply = `You have ${apps.length} recent application(s). Your latest is "${apps[0].jobTitle}" at ${apps[0].companyName} with status: ${apps[0].status}.`;
            actions = [{ label: 'View Applications', url: '/student/applications' }];
        } else {
            reply = "I couldn't find any applications for you. Try applying to some jobs!";
            actions = [{ label: 'Browse Jobs', url: '/student/jobs' }];
        }
    } else if (q.includes('job') || q.includes('opening') || q.includes('position')) {
        if (ctx.jobs.length > 0) {
            reply = `There are ${ctx.jobs.length} job(s) available. Check the job board for details!`;
            actions = [{ label: 'View Jobs', url: role === 'RECRUITER' ? '/recruiter/jobs' : '/student/jobs' }];
        } else {
            reply = "No active jobs at the moment. Check back soon!";
        }
    } else if (q.includes('profile') || q.includes('resume') || q.includes('score')) {
        const profile = ctx.profile;
        if (profile.atsScore || profile.profileStrength) {
            reply = `Your ATS Score is ${profile.atsScore || 'N/A'} and Profile Strength is ${profile.profileStrength || 'N/A'}. Keep updating your skills for better scores!`;
        } else {
            reply = "Upload your resume to get AI-powered scores and recommendations.";
        }
        actions = [{ label: 'Edit Profile', url: '/student/profile' }];
    } else if (q.includes('interview') || q.includes('prep')) {
        reply = "Our AI Interview Prep module simulates real interview scenarios. Give it a try!";
        actions = [{ label: 'Start Practice', url: '/student/interview-prep' }];
    } else if (q.includes('broadcast') || q.includes('announcement')) {
        if (ctx.broadcasts.length > 0) {
            reply = `Latest broadcast: "${ctx.broadcasts[0].title}" — ${ctx.broadcasts[0].message?.substring(0, 100)}`;
        } else {
            reply = "No recent announcements. You're all caught up!";
        }
    } else {
        reply = `Hi ${ctx.name}! I'm your placement assistant. You can ask me about your applications, jobs, profile scores, interview prep, or recent announcements.`;
        if (role === 'STUDENT') {
            actions = [
                { label: 'My Applications', url: '/student/applications' },
                { label: 'Browse Jobs', url: '/student/jobs' }
            ];
        } else if (role === 'RECRUITER') {
            actions = [
                { label: 'My Jobs', url: '/recruiter/jobs' },
                { label: 'Applicants', url: '/recruiter/applications' }
            ];
        }
    }

    return { reply, actions };
}

module.exports = { getChatbotReply };
