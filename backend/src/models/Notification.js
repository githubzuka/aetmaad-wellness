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
      enum: ['shop_feedback', 'order_status', 'volunteer_application', 'event_proposal', 'event_upcoming', 'general', 'system'],
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

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
