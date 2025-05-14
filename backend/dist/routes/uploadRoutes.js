"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const upload_1 = __importDefault(require("../middleware/upload"));
const router = express_1.default.Router();
// @desc    Upload a single file
// @route   POST /api/upload/single
// @access  Private
router.post('/single', auth_1.protect, upload_1.default.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded'
        });
    }
    // Return file information
    const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}`;
    res.status(200).json({
        success: true,
        data: {
            fileName: req.file.filename,
            fileUrl,
            fileType: req.file.mimetype,
            size: req.file.size
        }
    });
});
// @desc    Upload multiple files (max 5)
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', auth_1.protect, upload_1.default.array('files', 5), (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No files uploaded'
        });
    }
    // Return information for all files
    const fileData = files.map(file => {
        const fileUrl = `${req.protocol}://${req.get('host')}/${file.path.replace(/\\/g, '/')}`;
        return {
            fileName: file.filename,
            fileUrl,
            fileType: file.mimetype,
            size: file.size
        };
    });
    res.status(200).json({
        success: true,
        count: files.length,
        data: fileData
    });
});
// @desc    Upload gallery files (up to 10 images and 3 videos)
// @route   POST /api/upload/gallery
// @access  Private
router.post('/gallery', auth_1.protect, (req, res, next) => {
    const galleryUpload = upload_1.default.fields([
        { name: 'images', maxCount: 10 },
        { name: 'videos', maxCount: 3 }
    ]);
    galleryUpload(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        const files = req.files;
        if (!files || Object.keys(files).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }
        // Process uploaded files
        const response = { success: true };
        if (files.images) {
            response.images = files.images.map(file => {
                return `${req.protocol}://${req.get('host')}/${file.path.replace(/\\/g, '/')}`;
            });
        }
        if (files.videos) {
            response.videos = files.videos.map(file => {
                return `${req.protocol}://${req.get('host')}/${file.path.replace(/\\/g, '/')}`;
            });
        }
        res.status(200).json(response);
    });
});
exports.default = router;
