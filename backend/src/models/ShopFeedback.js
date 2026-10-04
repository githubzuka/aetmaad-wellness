import mongoose from 'mongoose';

const shopFeedbackSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      default: 'Active',
    },
    suppliesNote: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const ShopFeedback = mongoose.models.ShopFeedback || mongoose.model('ShopFeedback', shopFeedbackSchema);

export default ShopFeedback;