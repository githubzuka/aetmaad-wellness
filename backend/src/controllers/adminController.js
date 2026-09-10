import User from '../models/User.js';
import Shop from '../models/Shop.js';
import Order from '../models/Order.js';
import sendEmail from '../utils/sendEmail.js';

/**
 * @desc    Get list of all volunteers (filter by status)
 * @route   GET /api/admin/volunteers
 * @access  Private/Admin
 */
export const getVolunteers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { role: 'volunteer' };

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    const volunteers = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: volunteers.length,
      data: volunteers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve or Reject a volunteer application
 * @route   PUT /api/admin/volunteers/:id/status
 * @access  Private/Admin
 */
export const updateVolunteerStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Valid status required (approved, rejected, pending)' });
    }

    const volunteer = await User.findById(req.params.id);

    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    const previousStatus = volunteer.status;
    volunteer.status = status;
    await volunteer.save();

    if (status === 'approved' && previousStatus !== 'approved') {
      try {
        await sendEmail({
          to: volunteer.email,
          subject: 'Your ASHVA volunteer application has been approved',
          text: `Hello ${volunteer.name},\n\nYour ASHVA volunteer application has been approved by the admin team. You can now sign in to access the Volunteer Desk.\n\nRegards,\nASHVA Admin Team`,
          html: `<p>Hello ${volunteer.name},</p><p>Your ASHVA volunteer application has been approved by the admin team. You can now sign in to access the Volunteer Desk.</p><p>Regards,<br>ASHVA Admin Team</p>`,
        });
      } catch (emailError) {
        console.error('Volunteer approval email failed:', emailError.message);
      }
    }

    res.json({
      success: true,
      message: `Volunteer status updated to ${status}`,
      data: {
        _id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        role: volunteer.role,
        status: volunteer.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reassign a shop to a volunteer
 * @route   PUT /api/admin/shops/:id/assign
 * @access  Private/Admin
 */
export const assignShopVolunteer = async (req, res, next) => {
  try {
    const { volunteerId } = req.body;

    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    if (volunteerId) {
      const volunteer = await User.findById(volunteerId);
      if (!volunteer || volunteer.role !== 'volunteer') {
        return res.status(400).json({ message: 'Target user is not a valid volunteer' });
      }
      shop.volunteer = volunteerId;
    } else {
      shop.volunteer = null;
    }

    shop.lastUpdated = Date.now();
    await shop.save();

    const updatedShop = await Shop.findById(shop._id).populate('volunteer', 'name email contactNumber city');

    res.json({
      success: true,
      message: 'Shop volunteer assignment updated successfully',
      data: updatedShop,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard statistics for Admin
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
    const pendingVolunteers = await User.countDocuments({ role: 'volunteer', status: 'pending' });
    const totalShops = await Shop.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalVolunteers,
        pendingVolunteers,
        totalShops,
        totalOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};
