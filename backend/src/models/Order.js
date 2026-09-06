import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Product',
    required: false,
  },
  productId: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    default: 'ASHVA Equine Nutrition Mix (10kg)',
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  priceType: {
    type: String,
    enum: ['retail', 'bulk'],
    default: 'retail',
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
    },
    shop: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Shop',
      required: false,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'ONLINE'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    shippingAddress: {
      name: { type: String, default: '' },
      contactNumber: { type: String, default: '' },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    orderType: {
      type: String,
      enum: ['normal', 'bulk'],
      default: 'normal',
    },
    placedBy: {
      type: String,
      enum: ['customer', 'volunteer'],
      default: 'customer',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'dispatched', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
