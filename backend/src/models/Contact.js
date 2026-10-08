import mongoose from 'mongoose';

/**
 * Contact / outreach enquiries submitted from the public Contact page.
 * Every submission notifies the admin team and appears in the admin panel.
 */
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 120 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: { type: String, default: '', trim: true },
    subject: { type: String, default: 'General Enquiry', trim: true, maxlength: 200 },
    // 'general' | 'order' | 'volunteer' | 'donation' | 'complaint'
    category: {
      type: String,
      enum: ['general', 'order', 'volunteer', 'donation', 'complaint'],
      default: 'general',
    },
    message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: 3000 },
    // 'new' | 'in_progress' | 'resolved'
    status: { type: String, enum: ['new', 'in_progress', 'resolved'], default: 'new' },
    adminNote: { type: String, default: '', trim: true },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date, default: null },
    // Lightweight abuse-tracking context
    submittedIp: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1, createdAt: -1 });

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

export default Contact;
