// backend/services/user.service.js
const User = require('../models/User');

const getCurrentUser = async (userId) => {
    return await User.findById(userId).select('-googleId');
};

const bulkImportStudents = async (collegeId, data) => {
    // 1. Get all emails from the incoming data
    const incomingEmails = data.map(item => item.email);
    
    // 2. Find existing users with these emails (GLOBAL check)
    const existingUsers = await User.find({ 
        email: { $in: incomingEmails } 
    }).distinct('email');

    // 3. Filter out existing ones
    const newStudentData = data.filter(item => !existingUsers.includes(item.email));

    if (newStudentData.length === 0) {
        return { 
            message: 'No new students to import. All provided emails already exist.',
            addedCount: 0,
            skippedCount: existingUsers.length,
            totalProcessed: data.length
        };
    }

    const students = newStudentData.map(item => ({
        email: item.email,
        name: item.name || item.email.split('@')[0],
        collegeId,
        password: 'password123',
        role: 'STUDENT',
        mustChangePassword: true,
        isActive: true,
        profile: {
            rollNumber: item.rollNumber || item.RollNumber || '',
            department: item.department || item.Department || '',
            cgpa: parseFloat(item.cgpa || item.CGPA || 0)
        }
    }));

    const created = await User.create(students);
    return {
        message: `Successfully imported ${created.length} students.`,
        addedCount: created.length,
        skippedCount: existingUsers.length,
        totalProcessed: data.length,
        users: created
    };
};

const bulkImportFaculties = async (collegeId, data) => {
    const incomingEmails = data.map(item => item.email);
    
    const existingUsers = await User.find({ 
        email: { $in: incomingEmails } 
    }).distinct('email');

    const newFacultyData = data.filter(item => !existingUsers.includes(item.email));

    if (newFacultyData.length === 0) {
        return { 
            message: 'No new faculties to import. All provided emails already exist.',
            addedCount: 0,
            skippedCount: existingUsers.length,
            totalProcessed: data.length
        };
    }

    const faculties = newFacultyData.map(item => ({
        email: item.email,
        name: item.name || item.email.split('@')[0],
        collegeId,
        password: 'password123',
        role: 'FACULTY',
        mustChangePassword: true,
        isActive: true,
        profile: {
            department: item.department || item.Department || ''
        }
    }));

    const created = await User.create(faculties);
    return {
        message: `Successfully imported ${created.length} faculties.`,
        addedCount: created.length,
        skippedCount: existingUsers.length,
        totalProcessed: data.length,
        users: created
    };
};

const assignFacultyToStudents = async (collegeId, facultyId, studentIds) => {
    // 1. Check if any of these students are already assigned to a DIFFERENT faculty
    const alreadyAssigned = await User.find({
        _id: { $in: studentIds },
        collegeId,
        'profile.assignedFacultyId': { $exists: true, $ne: null }
    }).select('name');

    if (alreadyAssigned.length > 0) {
        const names = alreadyAssigned.map(u => u.name).join(', ');
        const error = new Error(`The following students are already assigned to a faculty: ${names}. Please unassign them first if you wish to re-map.`);
        error.status = 400;
        throw error;
    }

    return await User.updateMany(
        { _id: { $in: studentIds }, collegeId },
        { $set: { 'profile.assignedFacultyId': facultyId } }
    );
};

module.exports = {
    getCurrentUser,
    bulkImportStudents,
    bulkImportFaculties,
    assignFacultyToStudents
};
