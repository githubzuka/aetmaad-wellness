import express from 'express';
import { getUpcomingEvents, proposeVolunteerEvent, respondToVolunteerEvent } from '../controllers/eventController.js';
import { protect, authorize, checkVolunteerApproval } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getUpcomingEvents);
router.post('/propose', protect, authorize('volunteer'), checkVolunteerApproval, proposeVolunteerEvent);
router.patch('/:id/response', protect, authorize('volunteer'), checkVolunteerApproval, respondToVolunteerEvent);

export default router;
