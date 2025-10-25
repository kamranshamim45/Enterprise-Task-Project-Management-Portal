import express from 'express';
import { protect } from '../middleware/auth.js';
import { createTask, getTasks, getTask, updateTask, deleteTask, getAllTasks, uploadTaskFiles } from '../controllers/taskController.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for task file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/tasks/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'task-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and JPG files are allowed!'), false);
    }
  }
});

router.use(protect);
router.post('/', createTask);
router.get('/', getAllTasks);
router.get('/projects/:projectId/tasks', getTasks);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/upload', upload.array('files', 5), uploadTaskFiles); // Allow up to 5 files
export default router;
