import User from '../models/User.js';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Donation from '../models/Donation.js';

/**
 * Build the impact payload from live database collections.
 * Every metric is a real count — nothing is hard-coded or randomised.
 */
const buildImpactStats = async () => {
  const [
    approvedVolunteers,
    activeShops,
    products,
    ordersSupported,
    deliveredOrders,
    totalRevenueResult,
    cities,
    verifiedDonations,
    donationAmountResult,
  ] = await Promise.all([
    // Only fully approved volunteers count towards public impact
    User.countDocuments({ role: 'volunteer', status: 'approved' }),
    // Only active shops (deactivated shops should not inflate the number)
    Shop.countDocuments({ isActive: { $ne: false } }),
    Product.countDocuments({}),
    // Orders that actually happened (cancelled ones excluded)
    Order.countDocuments({ status: { $ne: 'cancelled' } }),
    Order.countDocuments({ status: 'delivered' }),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Shop.distinct('city', { isActive: { $ne: false } }),
    Donation.countDocuments({ status: { $in: ['received', 'verified'] } }),
    Donation.aggregate([
      { $match: { status: { $in: ['received', 'verified'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const orderValue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
  const donationValue = donationAmountResult.length > 0 ? donationAmountResult[0].total : 0;

  const distinctCities = cities.filter((city) => Boolean(city && String(city).trim()));

  return {
    // Core public counters (consumed by the home page Impact section)
    volunteers: approvedVolunteers,
    shops: activeShops,
    products,
    orders: ordersSupported,

    // Extra depth for richer impact storytelling
    deliveredOrders,
    citiesCovered: distinctCities.length,
    supportedValue: orderValue + donationValue,
    donations: verifiedDonations,

    // Metadata
    updatedAt: new Date().toISOString(),
  };
};

/**
 * @desc    Public aggregate impact metrics (no individual records exposed)
 * @route   GET /api/impact/stats
 * @access  Public
 */
export const getImpactStats = async (req, res, next) => {
  try {
    const stats = await buildImpactStats();

    // Never cache: impact figures must reflect the live database on every load
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
