import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['shop_feedback', 'order_status', 'volunteer_application', 'event_proposal', 'event_upcoming', 'general', 'system', 'security'],
      default: 'shop_feedback',
    },
    referenceId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // How many times an identical request collapsed into this one notification.
    // 1 = a single event, >1 = a repeated request shown only once.
    repeatCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    lastRepeatAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Sync read and isRead flags before saving
notificationSchema.pre('save', function (next) {
  if (this.isModified('read') && !this.isModified('isRead')) {
    this.isRead = this.read;
  } else if (this.isModified('isRead') && !this.isModified('read')) {
    this.read = this.isRead;
  }
  next();
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export default Notification;
