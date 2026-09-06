import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Shop from '../models/Shop.js';
import User from '../models/User.js';

/**
 * @desc    Place a new order (Retail, Bulk, or Direct Volunteer Order)
 * @route   POST /api/orders
 * @access  Private (Customer, Volunteer, Admin)
 */
export const createOrder = async (req, res, next) => {
  try {
    const { shopId, customerId, orderType, items, paymentMethod, paymentStatus, shippingAddress, totalAmount } = req.body;

    // Only enforce that items is a non-empty array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items array is required' });
    }

    // Auto-resolve shopId safely if null or missing
    let targetShopId = null;

    if (shopId && shopId !== 'null' && shopId !== 'undefined' && mongoose.Types.ObjectId.isValid(shopId)) {
      targetShopId = shopId;
    } else if (items.length > 0 && items[0].productId && mongoose.Types.ObjectId.isValid(items[0].productId)) {
      const firstProduct = await Product.findById(items[0].productId);
      if (firstProduct && firstProduct.shop) {
        targetShopId = firstProduct.shop;
      }
    }

    if (!targetShopId) {
      const defaultShop = await Shop.findOne({});
      if (defaultShop) {
        targetShopId = defaultShop._id;
      }
    }

    // Determine order placedBy & target customer
    let targetCustomerId;
    let placedBy = req.body.placedBy === 'volunteer' || req.user.role === 'volunteer' ? 'volunteer' : 'customer';

    if (req.user.role === 'volunteer' || req.user.role === 'admin') {
      if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
        const existingCustomer = await User.findById(customerId);
        if (!existingCustomer) {
          return res.status(404).json({ message: 'Target customer user not found' });
        }
        targetCustomerId = existingCustomer._id;
      } else {
        targetCustomerId = req.user._id;
      }
    } else {
      targetCustomerId = req.user._id;
      placedBy = 'customer';
    }

    const resolvedOrderType = (orderType === 'bulk' || req.body.orderType === 'bulk') ? 'bulk' : 'normal';
    let calculatedTotal = 0;
    const orderItems = [];

    // Process each item (supporting static String IDs like "default-equine-mix" or ObjectIds)
    for (const item of items) {
      const qty = Number(item.quantity) || 1;
      let productRef = null;
      let rawProductId = item.productId || 'default-equine-mix';
      let itemName = item.name || 'ASHVA Equine Nutrition Mix (10kg)';
      let unitPrice = Number(item.price) || (resolvedOrderType === 'bulk' ? 1200 : 1500);

      if (rawProductId && mongoose.Types.ObjectId.isValid(rawProductId)) {
        const productObj = await Product.findById(rawProductId);
        if (productObj) {
          productRef = productObj._id;
          itemName = productObj.name || itemName;
          unitPrice = Number(item.price) || (resolvedOrderType === 'bulk' ? (productObj.bulkPrice || 1200) : (productObj.retailPrice || 1500));

          if (productObj.stock >= qty) {
            productObj.stock -= qty;
            await productObj.save();
          }
        }
      }

      const priceType = resolvedOrderType === 'bulk' ? 'bulk' : 'retail';
      const subtotal = unitPrice * qty;
      calculatedTotal += subtotal;

      orderItems.push({
        product: productRef || rawProductId,
        productId: rawProductId,
        name: itemName,
        quantity: qty,
        priceType,
        unitPrice,
        subtotal,
      });
    }

    const finalTotal = Number(totalAmount) || calculatedTotal;

    const order = await Order.create({
      customer: targetCustomerId,
      shop: targetShopId || undefined,
      items: orderItems,
      totalAmount: finalTotal,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentStatus || 'pending',
      shippingAddress: shippingAddress || {},
      orderType: resolvedOrderType,
      placedBy,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders across system (Admin only)
 * @route   GET /api/orders/all or GET /api/admin/orders
 * @access  Private (Admin)
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('customer', 'name email contactNumber role city')
      .populate('shop', 'name city address ownerName contactNumber')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged in user's orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
export const getMyOrders = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'customer' || !req.user.role) {
      query.customer = req.user._id;
    } else if (req.user.role === 'volunteer') {
      const volunteerShops = await Shop.find({
        $or: [{ city: new RegExp(req.user.city, 'i') }, { volunteer: req.user._id }],
      }).select('_id');

      const shopIds = volunteerShops.map((s) => s._id);
      query = {
        $or: [{ customer: req.user._id }, { shop: { $in: shopIds } }],
      };
    } else {
      query.customer = req.user._id;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email contactNumber')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get orders for a specific shop
 * @route   GET /api/shops/:shopId/orders
 * @access  Private (Admin, Volunteer)
 */
export const getShopOrders = async (req, res, next) => {
  try {
    if (!req.params.shopId || !mongoose.Types.ObjectId.isValid(req.params.shopId)) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const orders = await Order.find({ shop: req.params.shopId })
      .populate('customer', 'name email contactNumber city')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order details by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res, next) => {
  try {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email contactNumber address city')
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Place direct bulk order for shop by volunteer
 * @route   POST /api/orders/volunteer
 * @access  Private (Volunteer, Admin)
 */
export const createVolunteerOrder = async (req, res, next) => {
  req.body.placedBy = 'volunteer';
  if (!req.body.orderType) req.body.orderType = 'bulk';
  return createOrder(req, res, next);
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status or PATCH /api/orders/:id/status
 * @access  Private (Admin, Volunteer)
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'dispatched', 'shipped', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Valid status required (${validStatuses.join(', ')})` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: `Order status updated to '${status}'`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get orders placed by volunteer for shops
 * @route   GET /api/orders/my-volunteer-orders
 * @access  Private (Volunteer, Admin)
 */
export const getMyVolunteerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      $or: [
        { customer: req.user._id, placedBy: 'volunteer' },
        { customer: req.user._id, orderType: 'bulk' },
        { placedBy: 'volunteer' },
      ],
    })
      .populate('shop', 'name city address ownerName contactNumber')
      .populate('customer', 'name email contactNumber')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};
