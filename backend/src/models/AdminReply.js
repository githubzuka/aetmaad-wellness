import mongoose from 'mongoose';

/**
 * Admin <-> Volunteer conversation threads.
 * An admin can request more details on an event proposal (or reply directly),
 * and the volunteer sees the message in their volunteer desk and can reply back.
 */
const replySchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['admin', 'volunteer'], required: true },
    senderName: { type: String, default: '' },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const adminReplySchema = new mongoose.Schema(
  {
    // The event proposal this thread belongs to.
    // Null for direct admin -> volunteer conversations (no event involved).
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null, index: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // 'more_details' | 'approved_note' | 'rejected_note' | 'direct' | 'general'
    kind: {
      type: String,
      enum: ['more_details', 'approved_note', 'rejected_note', 'direct', 'general'],
      default: 'general',
    },
    subject: { type: String, default: '', trim: true },
    // Full conversation, oldest first
    messages: { type: [replySchema], default: [] },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

adminReplySchema.index({ volunteer: 1, lastActivityAt: -1 });

const AdminReply = mongoose.models.AdminReply || mongoose.model('AdminReply', adminReplySchema);

export default AdminReply;
