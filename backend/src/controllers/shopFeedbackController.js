import ShopFeedback from '../models/ShopFeedback.js';
import Shop from '../models/Shop.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * @desc    Submit weekly feedback for a shop
 * @route   POST /api/shops/:id/feedback
 * @access  Private (Volunteer, Admin)
 */
export const submitShopFeedback = async (req, res, next) => {
  try {
    const shopId = req.params.id;
    const { status, suppliesNote, notes } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Shop status option is required' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    // Save feedback record
    const feedback = await ShopFeedback.create({
      shop: shopId,
      volunteer: req.user._id,
      status: status || 'Active',
      suppliesNote: suppliesNote || '',
      notes: notes || '',
      submittedAt: new Date(),
    });

    // Update shop lastUpdated timestamp
    shop.lastUpdated = new Date();
    await shop.save();

    // Create Admin Notification(s)
    const adminUsers = await User.find({ role: 'admin' }).select('_id');
    const volunteerName = req.user.name || 'Volunteer';
    const notificationMessage = `Volunteer ${volunteerName} submitted weekly feedback for shop ${shop.name}.`;

    const metadata = {
      feedbackId: feedback._id,
      shopId: shop._id,
      shopName: shop.name,
      volunteerName,
      status,
      suppliesNote: suppliesNote || '',
      notes: notes || '',
      submittedAt: feedback.submittedAt,
    };

    if (adminUsers.length > 0) {
      const notifications = adminUsers.map((admin) => ({
        user: admin._id,
        title: 'New Weekly Feedback Submitted',
        message: notificationMessage,
        type: 'shop_feedback',
        referenceId: feedback._id,
        read: false,
        isRead: false,
        metadata,
      }));
      await Notification.insertMany(notifications);
    } else {
      await Notification.create({
        user: null,
        title: 'New Weekly Feedback Submitted',
        message: notificationMessage,
        type: 'shop_feedback',
        referenceId: feedback._id,
        read: false,
        isRead: false,
        metadata,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Weekly shop feedback submitted successfully',
      data: feedback,
      shopLastUpdated: shop.lastUpdated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get feedback history for a shop
 * @route   GET /api/shops/:id/feedback
 * @access  Private
 */
export const getShopFeedbackHistory = async (req, res, next) => {
  try {
    const feedbackList = await ShopFeedback.find({ shop: req.params.id })
      .populate('volunteer', 'name email contactNumber')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: feedbackList.length,
      data: feedbackList,
    });
  } catch (error) {
    next(error);
  }
};
