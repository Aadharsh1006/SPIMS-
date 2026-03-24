const resumeService = require('../services/resume.service');
const Resume = require('../models/Resume');
const { PDFParse: pdf } = require('pdf-parse');

const uploadResume = async (req, res, next) => {
    try {
        const resume = await resumeService.saveResume(req.user.userId, req.user.collegeId, req.body.rawText);
        res.status(201).json(resume);
    } catch (err) {
        next(err);
    }
};

const uploadResumeFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log(`Processing resume upload for user: ${req.user.userId}`);
        const parser = new pdf({ data: req.file.buffer });
        const result = await parser.getText();
        const text = result.text;

        if (!text || text.trim().length === 0) {
            throw new Error('PDF parsing returned empty text. Please ensure the PDF is not an image scan.');
        }

        const fs = require('fs');
        const path = require('path');
        const filename = `resume_${req.user.userId}_${Date.now()}.pdf`;
        const uploadDir = path.join(__dirname, '../uploads/resumes');

        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uploadPath = path.join(uploadDir, filename);
        fs.writeFileSync(uploadPath, req.file.buffer);

        console.log(`Extracted ${text.length} characters from PDF. Physical file saved. Syncing...`);
        const resume = await resumeService.saveResume(req.user.userId, req.user.collegeId, text);

        // Update storage details
        resume.storageUrl = `/uploads/resumes/${filename}`;
        resume.fileName = filename;
        await resume.save();

        res.status(201).json({
            ...resume.toObject(),
            extractedData: {
                ...(resume.parsed || {}),
                extractionMethod: resume.extractionMethod || 'Unknown'
            }
        });
    } catch (err) {
        console.error('AI Sync Controller Error:', err);
        res.status(500).json({
            message: 'Error during AI Sync',
            details: err.message
        });
    }
};

const getMyResumes = async (req, res, next) => {
    try {
        const resumes = await Resume.find({ studentId: req.user.userId, collegeId: req.user.collegeId }).sort({ version: -1 });
        res.json(resumes);
    } catch (err) {
        next(err);
    }
};

const getResumeByStudentId = async (req, res, next) => {
    try {
        const resume = await Resume.findOne({ studentId: req.params.studentId }).sort({ version: -1 });
        if (!resume) return res.status(404).json({ message: 'Resume not found' });
        res.json(resume);
    } catch (err) {
        next(err);
    }
};

module.exports = { uploadResume, uploadResumeFile, getMyResumes, getResumeByStudentId };
