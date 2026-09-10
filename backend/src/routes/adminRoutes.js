import express from 'express';
import {
  getVolunteers,
  updateVolunteerStatus,
  assignShopVolunteer,
  getAdminStats,
} from '../controllers/adminController.js';
import { getAllOrders } from '../controllers/orderController.js';
import { getAdminNotifications, markNotificationAsRead } from '../controllers/notificationController.js';
import {
  getAdminEvents,
  createAdminEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent,
} from '../controllers/eventController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getAdminDonations, updateDonationStatus } from '../controllers/donationController.js';

const router = express.Router();

// All admin routes require authentication & admin role
router.use(protect, authorize('admin'));

router.get('/volunteers', getVolunteers);
router.put('/volunteers/:id/status', updateVolunteerStatus);
router.put('/shops/:id/assign', assignShopVolunteer);
router.get('/stats', getAdminStats);
router.get('/orders', getAllOrders);

// Event management and volunteer proposal approval
router.get('/events', getAdminEvents);
router.post('/events', createAdminEvent);
router.put('/events/:id', updateEvent);
router.patch('/events/:id/status', updateEventStatus);
router.delete('/events/:id', deleteEvent);
router.get('/donations', getAdminDonations);
router.patch('/donations/:id/status', updateDonationStatus);

// Admin Notification Routes
router.get('/notifications', getAdminNotifications);
router.patch('/notifications/:id/read', markNotificationAsRead);
router.put('/notifications/:id/read', markNotificationAsRead);

export default router;
