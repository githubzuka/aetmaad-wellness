import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getUserNotifications);
router.route('/read-all').put(protect, markAllNotificationsAsRead);
router.route('/:id/read').put(protect, markNotificationAsRead);

export default router;
