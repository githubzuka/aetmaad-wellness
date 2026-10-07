import express from 'express';
import { chat } from '../controllers/chatController.js';

const router = express.Router();

// POST /api/chat  ->  handled by the Groq-backed controller
router.post('/', chat);

export default router;