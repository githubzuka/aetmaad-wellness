import express from 'express';
import {
  getVolunteers,
  updateVolunteerStatus,
  assignShopVolunteer,
  getAdminStats,
} from '../controllers/adminController.js';
import { getAllOrders } from '../controllers/orderController.js';
import { getAdminNotifications, markNotificationAsRead } from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication & admin role
router.use(protect, authorize('admin'));

router.get('/volunteers', getVolunteers);
router.put('/volunteers/:id/status', updateVolunteerStatus);
router.put('/shops/:id/assign', assignShopVolunteer);
router.get('/stats', getAdminStats);
router.get('/orders', getAllOrders);

// Admin Notification Routes
router.get('/notifications', getAdminNotifications);
router.patch('/notifications/:id/read', markNotificationAsRead);
router.put('/notifications/:id/read', markNotificationAsRead);

export default router;
