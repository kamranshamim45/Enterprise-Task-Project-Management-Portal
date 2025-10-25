import express from 'express';
import { protect } from '../middleware/auth.js';
import { sendMessage, getMessages } from '../controllers/messageController.js';

const router = express.Router();

router.use(protect);
router.post('/', sendMessage);
router.get('/:projectId', getMessages);

export default router;
