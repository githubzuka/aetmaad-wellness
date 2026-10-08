import express from 'express';
import { getMyReplies, volunteerReplyToThread } from '../controllers/adminReplyController.js';
import { protect, authorize, checkVolunteerApproval } from '../middleware/authMiddleware.js';

const router = express.Router();

// Volunteer-side access to admin conversations
router.get('/my', protect, authorize('volunteer'), checkVolunteerApproval, getMyReplies);
router.post('/:id/message', protect, authorize('volunteer'), checkVolunteerApproval, volunteerReplyToThread);

export default router;
