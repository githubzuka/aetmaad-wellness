import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    organizer: { type: String, required: true, trim: true },
    volunteerHostName: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    source: { type: String, enum: ['admin', 'volunteer'], default: 'volunteer' },
    volunteerResponse: { type: String, enum: ['pending', 'agreed', 'disagreed'], default: 'pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

eventSchema.index({ status: 1, date: 1 });

const Event = mongoose.model('Event', eventSchema);
export default Event;
