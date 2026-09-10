import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true, trim: true },
    donorEmail: { type: String, required: true, lowercase: true, trim: true },
    donorPhone: { type: String, required: true, trim: true },
    panNumber: { type: String, default: '', trim: true },
    message: { type: String, default: '', trim: true },
    amount: { type: Number, required: true, min: 1 },
    frequency: { type: String, enum: ['one-time', 'monthly'], default: 'one-time' },
    status: { type: String, enum: ['received', 'verified', 'cancelled'], default: 'received' },
    receiptNumber: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

donationSchema.index({ donorEmail: 1, createdAt: -1 });

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
