import mongoose from 'mongoose';

const shopFeedbackSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: [true, 'Shop reference is required'],
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Volunteer reference is required'],
    },
    status: {
      type: String,
      enum: ['Active', 'Inventory Low', 'Closed Temporarily', 'Needs Restock'],
      default: 'Active',
      required: [true, 'Shop status is required'],
    },
    suppliesNote: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
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

const ShopFeedback = mongoose.model('ShopFeedback', shopFeedbackSchema);
export default ShopFeedback;
