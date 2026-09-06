import Notification from '../models/Notification.js';

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
 * @desc    Get Admin notifications (including Weekly Shop Feedback notifications)
 * @route   GET /api/admin/notifications
 * @access  Private (Admin)
 */
export const getAdminNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [{ user: req.user._id }, { user: null }, { type: 'shop_feedback' }],
    }).sort({ createdAt: -1 });

    const unreadCount = notifications.filter((n) => !n.read && !n.isRead).length;

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
