import User from '../models/User.js';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

/**
 * Return public aggregate impact metrics without exposing individual records.
 */
export const getImpactStats = async (req, res, next) => {
  try {
    const [volunteers, shops, products, orders] = await Promise.all([
      User.countDocuments({ role: 'volunteer', status: 'approved' }),
      Shop.countDocuments({}),
      Product.countDocuments({}),
      Order.countDocuments({ status: { $ne: 'cancelled' } }),
    ]);

    res.json({
      success: true,
      data: {
        volunteers,
        shops,
        products,
        orders,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};