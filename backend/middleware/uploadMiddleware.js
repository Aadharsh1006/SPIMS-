const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Base uploads directory
const baseDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

const getUploadDir = (type = 'resumes') => {
    const dir = path.join(baseDir, type);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
};

const storage = multer.diskStorage({
    destination(req, file, cb) {
        // Default to attachments if not specified, otherwise use type from req
        const type = req.uploadType || 'attachments';
        cb(null, getUploadDir(type));
    },
    filename(req, file, cb) {
        cb(null, `${req.user ? req.user._id : 'guest'}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const checkFileType = (file, cb) => {
    // Allowed extensions for resumes AND general attachments
    const filetypes = /pdf|doc|docx|jpg|jpeg|png/;
    const mimetypes = /application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document|image\/jpeg|image\/png/;

    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = mimetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid File Type. Allowed: PDF, DOC, DOCX, JPG, PNG.'));
    }
};

const createUpload = (useMemoryStorage = false) => {
    return multer({
        storage: useMemoryStorage ? multer.memoryStorage() : storage,
        limits: { fileSize: 5 * 1024 * 1024 }, // Strict 5MB limit
        fileFilter: function (req, file, cb) {
            checkFileType(file, cb);
        }
    });
};

module.exports = createUpload;
