import Notification from '../models/Notification.js';
import User from '../models/User.js';

const DEDUPE_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Create a notification, but collapse repeats.
 *
 * If an identical notification (same title + message, still unread) already
 * exists within the dedupe window, we bump `repeatCount` and `lastRepeatAt` on
 * the existing record instead of inserting a duplicate. Repeated requests
 * therefore surface once, with an "×N" counter, rather than flooding the feed.
 *
 * @returns {Promise<{notification: object, deduped: boolean}>}
 */
export const createNotificationDeduped = async (payload) => {
  const { title, message, type, user = null, referenceId = null, metadata = {} } = payload;

  const since = new Date(Date.now() - DEDUPE_WINDOW_MS);

  const existing = await Notification.findOne({
    title,
    message,
    type,
    user,
    read: false,
    isRead: false,
    createdAt: { $gte: since },
  });

  if (existing) {
    existing.repeatCount = (existing.repeatCount || 1) + 1;
    existing.lastRepeatAt = new Date();
    // Keep the freshest metadata without losing the original reference
    existing.metadata = { ...(existing.metadata || {}), ...metadata };
    await existing.save();
    return { notification: existing, deduped: true };
  }

  const created = await Notification.create({
    user,
    title,
    message,
    type,
    referenceId,
    metadata,
    repeatCount: 1,
  });

  return { notification: created, deduped: false };
};

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getUserNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [{ user: req.user._id }, { user: null }],
    }).sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      $or: [{ user: req.user._id }, { user: null }],
      $and: [{ $or: [{ read: false }, { isRead: false }] }],
    });

    res.json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Admin notifications
 *          Returns every real notification record from the database:
 *          - shop_feedback, event_proposal, volunteer_application, order_status, system, general
 *          - broadcasts addressed to all admins (user: null)
 *          - admin-addressed notifications
 *          Volunteer-specific notifications are only surfaced when the volunteer
 *          is approved, so pending/rejected applications never leak in.
 * @route   GET /api/admin/notifications
 * @access  Private (Admin)
 */
export const getAdminNotifications = async (req, res, next) => {
  try {
    // 1. Resolve which volunteers are actually approved.
    const approvedVolunteers = await User.find({
      role: 'volunteer',
      status: 'approved',
    }).select('_id');

    const approvedVolunteerIds = approvedVolunteers.map((volunteer) =>
      volunteer._id.toString()
    );

    // 2. Fetch every notification addressed to an admin, or broadcast to all
    //    admins (user: null). `type` is intentionally not restricted so no
    //    notification category is silently dropped.
    const notifications = await Notification.find({
      $or: [
        { user: req.user._id },
        { user: null },
        { user: { $exists: false } },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    // 3. Guard against orphaned volunteer notifications: a notification that
    //    points at a volunteer (metadata.volunteerId) is only kept when that
    //    volunteer is currently approved.
    const visibleNotifications = notifications.filter((notification) => {
      const volunteerId = notification.metadata?.volunteerId;
      if (!volunteerId) return true;
      return approvedVolunteerIds.includes(String(volunteerId));
    });

    const unreadCount = visibleNotifications.filter(
      (notification) => !notification.read && !notification.isRead
    ).length;

    res.json({
      success: true,
      unreadCount,
      count: visibleNotifications.length,
      data: visibleNotifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a notification as read (User or Admin)
 * @route   PUT /api/notifications/:id/read or PATCH /api/admin/notifications/:id/read
 * @access  Private
 */
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (
      req.user.role !== 'admin' &&
      notification.user &&
      notification.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to access this notification' });
    }

    notification.read = true;
    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all user notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { $or: [{ user: req.user._id }, { user: null }] },
      { read: true, isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin Inbox — notifications the admin has ALREADY seen.
 *          Unread items stay in the Notifications list; once marked read they
 *          move here. Repeated identical events collapse into one row.
 * @route   GET /api/admin/notifications/inbox
 * @access  Private (Admin)
 */
export const getAdminInbox = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 300);

    const inbox = await Notification.find({
      $or: [
        { user: req.user._id },
        { user: null },
        { user: { $exists: false } },
      ],
      $and: [{ $or: [{ read: true }, { isRead: true }] }],
    })
      .sort({ lastRepeatAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      count: inbox.length,
      data: inbox,
    });
  } catch (error) {
    next(error);
  }
};
