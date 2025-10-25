import express from 'express';
import { register, login, getAllUsers, getMe, uploadProfilePicture } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', getAllUsers); // Admin only endpoint
router.post('/upload-profile-picture', protect, upload.single('profilePicture'), uploadProfilePicture);

export default router;
