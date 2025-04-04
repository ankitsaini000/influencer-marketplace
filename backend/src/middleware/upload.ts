import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = ['uploads', 'uploads/images', 'uploads/videos'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Create directories on startup
createUploadDirs();

// Define storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Determine destination folder based on file type
    if (file.mimetype.startsWith('image/')) {
      uploadPath = 'uploads/images/';
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath = 'uploads/videos/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const userId = req.user?._id || 'guest';
    cb(
      null,
      `${userId}-${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// File filter to allow only certain file types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images and videos
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|webm|mov|avi|mkv/;
  
  const ext = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (file.mimetype.startsWith('image/') && allowedImageTypes.test(ext)) {
    return cb(null, true);
  } else if (file.mimetype.startsWith('video/') && allowedVideoTypes.test(ext)) {
    return cb(null, true);
  } else {
    return cb(new Error('Only image and video files are allowed!'));
  }
};

// Initialize multer upload
const upload = multer({
  storage,
  limits: { 
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter,
});

export default upload; 