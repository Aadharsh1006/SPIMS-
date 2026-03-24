// backend/controllers/usersController.js
const User = require('../models/User');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Alumni = require('../models/Alumni');

const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        next(err);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        // Sanitize input: Prevent users from changing their own roles, collegeId, or active status
        const { role, collegeId, isActive, password, ...allowedUpdates } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Sync with StudentProfile if student
        if (user.role === 'STUDENT') {
            const StudentProfile = require('../models/StudentProfile');
            await StudentProfile.findOneAndUpdate(
                { userId: user._id },
                {
                    $set: {
                        parsedSkills: user.profile.skills,
                        experience: user.profile.experience,
                        education: user.profile.education,
                        projects: user.profile.projects,
                        achievements: user.profile.achievements,
                        bio: user.profile.bio,
                        certifications: user.profile.certifications,
                        linkedinUrl: user.profile.linkedinUrl,
                        githubUrl: user.profile.githubUrl,
                        atsScore: user.profile.atsScore,
                        profileStrength: user.profile.profileStrength,
                        scoreReasoning: user.profile.scoreReasoning,
                        recruiterPitch: user.profile.recruiterPitch,
                        careerPaths: user.profile.careerPaths,
                        softSkills: user.profile.softSkills,
                        interests: user.profile.interests
                    }
                },
                { upsert: true }
            );
        }

        res.json(user);
    } catch (err) {
        next(err);
    }
};

const getStudents = async (req, res, next) => {
    try {
        const filter = { collegeId: req.user.collegeId, role: 'STUDENT' };
        if (req.user.role === 'FACULTY') {
            filter['profile.assignedFacultyId'] = req.user.userId;
        }

        if (req.user.role === 'ALUMNI') {
            const Alumni = require('../models/Alumni');
            const Application = require('../models/Application');
            const Job = require('../models/Job');
            const dbUser = await User.findById(req.user.userId).select('profile');
            const alumniRecord = await Alumni.findOne({ userId: req.user.userId });
            const alumniCompany = (dbUser?.profile?.company || alumniRecord?.company)?.toString().trim();
            if (!alumniCompany) return res.json([]);

            const matchingJobs = await Job.find({ company: new RegExp(`^${alumniCompany}$`, 'i') }).distinct('_id');
            const acceptedAppStudentIds = await Application.find({
                collegeId: req.user.collegeId,
                jobId: { $in: matchingJobs },
                status: { $in: ['RECRUITER_SHORTLISTED', 'INTERVIEW_IN_PROGRESS', 'OFFERED', 'OFFER_ACCEPTED', 'HIRED'] }
            }).distinct('studentId');

            filter._id = { $in: acceptedAppStudentIds };
        }

        const students = await User.find(filter).select('-password');
        res.json(students);
    } catch (err) {
        next(err);
    }
};

const getFaculties = async (req, res, next) => {
    try {
        const faculties = await User.find({ collegeId: req.user.collegeId, role: 'FACULTY' }).select('-password');
        res.json(faculties);
    } catch (err) {
        next(err);
    }
};

const getAlumni = async (req, res, next) => {
    try {
        const alumni = await User.find({ collegeId: req.user.collegeId, role: 'ALUMNI' }).select('-password');
        res.json(alumni);
    } catch (err) {
        next(err);
    }
};

const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive, status } = req.body;

        // Use isActive if provided, otherwise fallback to status (for frontend compatibility)
        const finalStatus = isActive !== undefined ? isActive : status;

        const user = await User.findByIdAndUpdate(
            id,
            { $set: { isActive: finalStatus } },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        next(err);
    }
};

const bulkUpdateUserStatus = async (req, res, next) => {
    try {
        const { ids, isActive } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No user IDs provided' });
        }

        const results = await User.updateMany(
            { _id: { $in: ids }, collegeId: req.user.collegeId },
            { $set: { isActive } }
        );

        res.json({ message: `Successfully updated ${results.modifiedCount} users`, count: results.modifiedCount });
    } catch (err) {
        next(err);
    }
};

const canMessage = async (myUserShort, otherUser) => {
    // 0. Ensure basic context
    if (!myUserShort || !otherUser) return false;

    // Fetch full myUser if it's just the req.user from token (missing profile or collegeId context)
    let myUser = myUserShort;
    if (!myUser.profile || !myUser.collegeId || !myUser.role) {
        myUser = await User.findById(myUserShort.userId || myUserShort._id).select('role profile collegeId');
        if (!myUser) return false;
    }

    // Ensure otherUser has necessary fields
    if (!otherUser.role || !otherUser.profile || (!otherUser.collegeId && otherUser.role !== 'RECRUITER' && otherUser.role !== 'SUPER_ADMIN')) {
        const fullOther = await User.findById(otherUser._id).select('role profile collegeId');
        if (!fullOther) return false;
        otherUser = fullOther;
    }

    const sameCollege = myUser.collegeId === otherUser.collegeId;
    const myId = (myUser._id || myUser.userId).toString();
    const otherId = otherUser._id.toString();

    // Prevent messaging self in directory
    if (myId === otherId) return false;

    // RULE 6: SuperAdmin Access (Bidirectional for TPO, Alumni, Recruiter ONLY)
    if (myUser.role === 'SUPER_ADMIN' || otherUser.role === 'SUPER_ADMIN') {
        const allowedRoles = ['TPO', 'RECRUITER', 'ALUMNI'];
        const myIsAllowed = allowedRoles.includes(myUser.role);
        const otherIsAllowed = allowedRoles.includes(otherUser.role);

        // If one is superadmin, the other MUST be in allowedRoles
        if (myUser.role === 'SUPER_ADMIN') return otherIsAllowed;
        if (otherUser.role === 'SUPER_ADMIN') return myIsAllowed;
        return false;
    }

    // RULE 3 & 4 & 5 & 2: College Staff (TPO/Faculty/Alumni)
    if (myUser.role === 'TPO') {
        // TPO can message Students, Faculties, Alumni of their college (Rule 3)
        if (sameCollege && ['FACULTY', 'ALUMNI', 'STUDENT'].includes(otherUser.role)) return true;
        
        // TPO can message Recruiters for jobs requested/granted (Rule 3)
        if (otherUser.role === 'RECRUITER') {
            const hasJob = await Job.findOne({
                recruiterId: otherUser._id,
                $or: [
                    { collegeId: myUser.collegeId },
                    { 'accessByColleges.collegeId': myUser.collegeId, 'accessByColleges.status': 'APPROVED' }
                ]
            });
            return !!hasJob;
        }
    }

    if (otherUser.role === 'TPO') {
        // Stakeholders can message their own TPO (Rule 1, 2, 5)
        if (sameCollege && ['FACULTY', 'ALUMNI', 'STUDENT'].includes(myUser.role)) return true;
        
        // Recruiters can message TPOs if job granted (Rule 4)
        if (myUser.role === 'RECRUITER') {
            const hasJob = await Job.findOne({
                recruiterId: myId,
                $or: [
                    { collegeId: otherUser.collegeId },
                    { 'accessByColleges.collegeId': otherUser.collegeId, 'accessByColleges.status': 'APPROVED' }
                ]
            });
            return !!hasJob;
        }
    }

    // RULE 1 & 2: Faculty <-> Student (Strictly Assigned)
    if (myUser.role === 'STUDENT' && otherUser.role === 'FACULTY') {
        return sameCollege && myUser.profile?.assignedFacultyId?.toString() === otherId;
    }
    if (myUser.role === 'FACULTY' && otherUser.role === 'STUDENT') {
        return sameCollege && otherUser.profile?.assignedFacultyId?.toString() === myId;
    }

    // RULE 2 & 5: Faculty <-> Alumni (Same College)
    if (myUser.role === 'FACULTY' && otherUser.role === 'ALUMNI') return sameCollege;
    if (myUser.role === 'ALUMNI' && otherUser.role === 'FACULTY') return sameCollege;

    // RULE 1, 4 & 5: Success-Based Relationships (Offers / Hired)
    
    // Student <-> Recruiter (Requires Offer)
    if (myUser.role === 'STUDENT' && otherUser.role === 'RECRUITER') {
        const myJobIds = await Job.find({ recruiterId: otherUser._id }).distinct('_id');
        const app = await Application.findOne({
            studentId: myId,
            jobId: { $in: myJobIds },
            status: { $in: ['OFFERED', 'OFFER_ACCEPTED', 'HIRED'] } // Tightened to Offer
        });
        return !!app;
    }
    if (myUser.role === 'RECRUITER' && otherUser.role === 'STUDENT') {
        const myJobs = await Job.find({ recruiterId: myId }).distinct('_id');
        const app = await Application.findOne({
            studentId: otherId,
            jobId: { $in: myJobs },
            status: { $in: ['RECRUITER_SHORTLISTED', 'INTERVIEW_IN_PROGRESS', 'OFFERED', 'OFFER_ACCEPTED', 'HIRED'] } // Recruiters can message shortlisted students
        });
        return !!app;
    }

    // Student <-> Alumni (Selection-Based / Same Company)
    if (myUser.role === 'STUDENT' && otherUser.role === 'ALUMNI') {
        if (!sameCollege) return false;
        const alumniRecord = await Alumni.findOne({ userId: otherUser._id });
        const alumniCompany = (otherUser.profile?.company || alumniRecord?.company)?.toString().trim();
        if (!alumniCompany) return false;

        const matchingJobs = await Job.find({ company: new RegExp(`^${alumniCompany}$`, 'i') }).distinct('_id');
        const app = await Application.findOne({
            studentId: myId,
            jobId: { $in: matchingJobs },
            status: { $in: ['RECRUITER_SHORTLISTED', 'INTERVIEW_IN_PROGRESS', 'OFFERED', 'OFFER_ACCEPTED', 'HIRED'] } // Rule 1: message alumni after selection/shortlist
        });
        return !!app;
    }
    if (myUser.role === 'ALUMNI' && otherUser.role === 'STUDENT') {
        if (!sameCollege) return false;
        const alumniRecord = await Alumni.findOne({ userId: myId });
        const alumniCompany = (myUser.profile?.company || alumniRecord?.company)?.toString().trim();
        if (!alumniCompany) return false;

        const matchingJobs = await Job.find({ company: new RegExp(`^${alumniCompany}$`, 'i') }).distinct('_id');
        const app = await Application.findOne({
            studentId: otherId,
            jobId: { $in: matchingJobs },
            status: { $in: ['RECRUITER_SHORTLISTED', 'INTERVIEW_IN_PROGRESS', 'OFFERED', 'OFFER_ACCEPTED', 'HIRED'] } // Rule 5: Selection-based mentoring
        });
        return !!app;
    }

    return false;
};

const getStaff = async (req, res, next) => {
    try {
        let userContext = req.user;
        const myId = (userContext.userId || userContext._id).toString();

        // Fetch full context if profile is missing (authMiddleware only provides userId/role/collegeId)
        if (!userContext.profile && userContext.role !== 'SUPER_ADMIN') {
            const dbUser = await User.findById(myId).select('collegeId role profile');
            if (dbUser) {
                userContext = { ...userContext, collegeId: dbUser.collegeId, role: dbUser.role, profile: dbUser.profile };
            }
        }

        let contactIds = new Set();
        const sameCollegeFilter = { collegeId: userContext.collegeId };

        // 1. STAKEHOLDERS: TPO and SuperAdmin (Condition: restricted to TPO, Alumni, Recruiter for SuperAdmin)
        if (userContext.role !== 'SUPER_ADMIN') {
            const stakeHoldersQuery = {
                $or: [
                    { ...sameCollegeFilter, role: 'TPO' }
                ]
            };
            
            // Only TPO, Alumni, and Recruiter can see SuperAdmin
            if (['TPO', 'ALUMNI', 'RECRUITER'].includes(userContext.role)) {
                stakeHoldersQuery.$or.push({ role: 'SUPER_ADMIN' });
            }

            const stakeHolders = await User.find(stakeHoldersQuery).distinct('_id');
            stakeHolders.forEach(id => contactIds.add(id.toString()));
        }

        // 2. ROLE-SPECIFIC DISCOVERY
        if (userContext.role === 'STUDENT') {
            const faculty = await User.find({ ...sameCollegeFilter, role: 'FACULTY' }).distinct('_id');
            faculty.forEach(id => contactIds.add(id.toString()));

            const myApps = await Application.find({
                studentId: myId,
                status: { $in: ['OFFERED', 'OFFER_ACCEPTED', 'HIRED'] }
            }).populate('jobId');

            const myCompanies = [...new Set(myApps.map(a => a.jobId?.company).filter(Boolean))];
            if (myCompanies.length > 0) {
                const matchingAlumni = await User.find({
                    ...sameCollegeFilter,
                    role: 'ALUMNI',
                    'profile.company': { $in: myCompanies.map(c => new RegExp(`^${c}$`, 'i')) }
                }).distinct('_id');
                matchingAlumni.forEach(id => contactIds.add(id.toString()));

                const recruiterIds = myApps.map(a => a.jobId?.recruiterId?.toString()).filter(Boolean);
                recruiterIds.forEach(id => contactIds.add(id));
            }
        } else if (userContext.role === 'ALUMNI') {
            const faculty = await User.find({ ...sameCollegeFilter, role: 'FACULTY' }).distinct('_id');
            faculty.forEach(id => contactIds.add(id.toString()));

            const alumniRecord = await Alumni.findOne({ userId: myId });
            const myCompany = (userContext.profile?.company || alumniRecord?.company);
            if (myCompany) {
                const myCompanyJobs = await Job.find({ company: new RegExp(`^${myCompany}$`, 'i') }).distinct('_id');
                const hiredApps = await Application.find({
                    jobId: { $in: myCompanyJobs },
                    status: { $in: ['RECRUITER_SHORTLISTED', 'INTERVIEW_IN_PROGRESS', 'OFFERED', 'OFFER_ACCEPTED', 'HIRED'] }
                }).distinct('studentId');
                hiredApps.forEach(id => contactIds.add(id.toString()));
            }
        } else if (userContext.role === 'FACULTY') {
            const myStudents = await User.find({
                ...sameCollegeFilter,
                role: 'STUDENT',
                'profile.assignedFacultyId': myId
            }).distinct('_id');
            myStudents.forEach(id => contactIds.add(id.toString()));

            const alumni = await User.find({ ...sameCollegeFilter, role: 'ALUMNI' }).distinct('_id');
            alumni.forEach(id => contactIds.add(id.toString()));
        } else if (userContext.role === 'TPO') {
            const members = await User.find({
                ...sameCollegeFilter,
                role: { $in: ['STUDENT', 'FACULTY', 'ALUMNI'] }
            }).distinct('_id');
            members.forEach(id => contactIds.add(id.toString()));

            const myJobs = await Job.find({
                $or: [
                    { collegeId: userContext.collegeId },
                    { 'accessByColleges.collegeId': userContext.collegeId }
                ]
            }).distinct('recruiterId');
            myJobs.forEach(id => id && contactIds.add(id.toString()));
        } else if (userContext.role === 'RECRUITER') {
            const myJobs = await Job.find({ recruiterId: myId });
            const myColleges = [];
            myJobs.forEach(j => {
                if (j.collegeId) myColleges.push(j.collegeId);
                if (j.accessByColleges) {
                    j.accessByColleges.forEach(a => a.status === 'APPROVED' && myColleges.push(a.collegeId));
                }
            });

            if (myColleges.length > 0) {
                const tpos = await User.find({ role: 'TPO', collegeId: { $in: myColleges } }).distinct('_id');
                tpos.forEach(id => contactIds.add(id.toString()));

                const selected = await Application.find({
                    jobId: { $in: myJobs.map(j => j._id) },
                    status: { $in: ['RECRUITER_SHORTLISTED', 'INTERVIEW_IN_PROGRESS', 'OFFERED', 'OFFER_ACCEPTED', 'HIRED'] }
                }).distinct('studentId');
                selected.forEach(id => contactIds.add(id.toString()));
            }
        } else if (userContext.role === 'SUPER_ADMIN') {
            const staff = await User.find({ 
                role: { $in: ['TPO', 'RECRUITER', 'ALUMNI'] } 
            }).distinct('_id');
            staff.forEach(id => contactIds.add(id.toString()));
        }

        contactIds.delete(myId);
        const contacts = await User.find({
            _id: { $in: Array.from(contactIds) }
        }).select('_id name email role profile collegeId');

        res.json(contacts);
    } catch (err) {
        console.error('getStaff error:', err);
        res.status(500).json({ error: 'Failed to search contacts' });
    }
};

const toggleBookmark = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.profile.bookmarks) user.profile.bookmarks = [];

        const index = user.profile.bookmarks.indexOf(jobId);
        if (index > -1) {
            user.profile.bookmarks.splice(index, 1);
        } else {
            user.profile.bookmarks.push(jobId);
        }

        await user.save();
        res.json({ bookmarks: user.profile.bookmarks });
    } catch (err) {
        next(err);
    }
};

const getBroadcasts = async (req, res, next) => {
    try {
        const Broadcast = require('../models/Broadcast');
        
        // Build query to get global broadcasts (collegeId: null) or college-specific ones
        const query = {
            $or: [
                { collegeId: null },
                { collegeId: req.user.collegeId }
            ]
        };

        // Match 'All' or the user's specific role (case-insensitive for safety)
        const userRole = req.user.role ? req.user.role.toUpperCase() : null;
        query.targetAudience = { 
            $in: ['All', userRole, 'STUDENT', 'FACULTY', 'RECRUITER', 'ALUMNI', 'TPO'].filter(r => r === 'All' || r === userRole)
        };

        const broadcasts = await Broadcast.find(query).sort({ createdAt: -1 }).limit(10).lean();
        res.json(broadcasts);
    } catch (err) {
        console.error('Error in getBroadcasts:', err);
        next(err);
    }
};

module.exports = { getMe, updateProfile, getStudents, getFaculties, getAlumni, updateUserStatus, bulkUpdateUserStatus, getStaff, canMessage, toggleBookmark, getBroadcasts };
