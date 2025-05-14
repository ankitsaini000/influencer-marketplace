"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure upload directories exist
const createUploadDirs = () => {
    const dirs = ['uploads', 'uploads/images', 'uploads/videos'];
    dirs.forEach(dir => {
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
    });
};
// Create directories on startup
createUploadDirs();
// Define storage configuration for multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';
        // Determine destination folder based on file type
        if (file.mimetype.startsWith('image/')) {
            uploadPath = 'uploads/images/';
        }
        else if (file.mimetype.startsWith('video/')) {
            uploadPath = 'uploads/videos/';
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        var _a;
        // Generate unique filename with original extension
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || 'guest';
        cb(null, `${userId}-${file.fieldname}-${Date.now()}${path_1.default.extname(file.originalname)}`);
    },
});
// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
    // Accept images and videos
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedVideoTypes = /mp4|webm|mov|avi|mkv/;
    const ext = path_1.default.extname(file.originalname).toLowerCase().substring(1);
    if (file.mimetype.startsWith('image/') && allowedImageTypes.test(ext)) {
        return cb(null, true);
    }
    else if (file.mimetype.startsWith('video/') && allowedVideoTypes.test(ext)) {
        return cb(null, true);
    }
    else {
        return cb(new Error('Only image and video files are allowed!'));
    }
};
// Initialize multer upload
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit for videos
    },
    fileFilter,
});
exports.default = upload;
