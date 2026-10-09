import express from 'express';
import {
  getVolunteers,
  updateVolunteerStatus,
  assignShopVolunteer,
  getAdminStats,
} from '../controllers/adminController.js';
import { getAllOrders } from '../controllers/orderController.js';
import { getAdminNotifications, markNotificationAsRead, getAdminInbox } from '../controllers/notificationController.js';
import {
  createAdminReply,
  getAdminReplies,
  closeAdminReply,
  getMessageableVolunteers,
  sendDirectMessage,
  getAuditTrail,
} from '../controllers/adminReplyController.js';
import { getAdminContacts, updateContactStatus } from '../controllers/contactController.js';
import {
  getAdminEvents,
  createAdminEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent,
} from '../controllers/eventController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getAdminDonations, updateDonationStatus } from '../controllers/donationController.js';
import User from '../models/User.js';

const router = express.Router();

// All admin routes require authentication & admin role
router.use(protect, authorize('admin'));

router.get('/volunteers', getVolunteers);
router.put('/volunteers/:id/status', updateVolunteerStatus);
router.put('/shops/:id/assign', assignShopVolunteer);
router.get('/stats', getAdminStats);
router.get('/orders', getAllOrders);

// Customer management — only fetch users with role 'customer'
router.get('/customers', async (req, res) => {
  try {
    const { search = '' } = req.query;

    const baseFilter = { role: 'customer' };

    const query = search
      ? {
          ...baseFilter,
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { contactNumber: { $regex: search, $options: 'i' } },
            { city: { $regex: search, $options: 'i' } },
          ],
        }
      : baseFilter;

    const customers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: customers.length, customers, data: customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Error fetching customer data' });
  }
});

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
// Seen notifications move out of the notification list into the inbox
router.get('/notifications/inbox', getAdminInbox);
router.patch('/notifications/:id/read', markNotificationAsRead);
router.put('/notifications/:id/read', markNotificationAsRead);

// Admin <-> Volunteer conversation threads (event proposals / direct replies)
router.get('/replies', getAdminReplies);
router.post('/replies', createAdminReply);
router.patch('/replies/:id/close', closeAdminReply);

// Direct admin -> volunteer messaging
router.get('/messageable-volunteers', getMessageableVolunteers);
router.post('/messages', sendDirectMessage);

// Audit trail: everything that came in, admin decisions, and saved responses
router.get('/audit-trail', getAuditTrail);

// Contact / outreach enquiries from the public site
router.get('/contacts', getAdminContacts);
router.patch('/contacts/:id', updateContactStatus);

export default router;