// backend/controllers/collegeController.js
const userService = require('../services/user.service');

const importStudents = async (req, res, next) => {
    try {
        const students = await userService.bulkImportStudents(req.user.collegeId, req.body.students);
        res.status(201).json(students);
    } catch (err) {
        next(err);
    }
};

const importFaculties = async (req, res, next) => {
    try {
        const faculties = await userService.bulkImportFaculties(req.user.collegeId, req.body.faculties);
        res.status(201).json(faculties);
    } catch (err) {
        next(err);
    }
};

const assignFaculty = async (req, res, next) => {
    try {
        const { facultyId, studentIds } = req.body;
        await userService.assignFacultyToStudents(req.user.collegeId, facultyId, studentIds);
        res.json({ message: 'Faculty assigned successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = { importStudents, importFaculties, assignFaculty };
