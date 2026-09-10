import Donation from '../models/Donation.js';
import Notification from '../models/Notification.js';
import sendEmail from '../utils/sendEmail.js';

const createReceiptNumber = () => `ASHVA-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

export const createDonation = async (req, res, next) => {
  try {
    const { amount, frequency, donor } = req.body;
    if (!amount || Number(amount) <= 0 || !donor?.name || !donor?.email || !donor?.phone) {
      return res.status(400).json({ message: 'Amount, donor name, email, and phone are required' });
    }

    const donation = await Donation.create({
      donorName: donor.name,
      donorEmail: donor.email,
      donorPhone: donor.phone,
      panNumber: donor.panNumber || '',
      message: donor.message || '',
      amount: Number(amount),
      frequency: frequency === 'monthly' ? 'monthly' : 'one-time',
      receiptNumber: createReceiptNumber(),
    });

    await Notification.create({
      user: null,
      title: 'New Donation Received',
      message: `${donation.donorName} donated ₹${donation.amount.toLocaleString()} (${donation.frequency}).`,
      type: 'general',
      referenceId: donation._id,
      metadata: { donationId: donation._id, donorEmail: donation.donorEmail },
    });

    try {
      await sendEmail({
        to: donation.donorEmail,
        subject: 'Thank you for supporting ASHVA working horses',
        text: `Thank you, ${donation.donorName}, for your ${donation.frequency} donation of ₹${donation.amount.toLocaleString()} to ASHVA. Your receipt number is ${donation.receiptNumber}.`,
        html: `<p>Thank you, ${donation.donorName}, for your ${donation.frequency} donation of <strong>₹${donation.amount.toLocaleString()}</strong> to ASHVA.</p><p>Your receipt number is <strong>${donation.receiptNumber}</strong>.</p>`,
      });
    } catch (emailError) {
      console.error('Donation confirmation email failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Donation received successfully',
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    const totals = await Donation.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, amount: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      count: donations.length,
      totals: totals[0] || { amount: 0, count: 0 },
      data: donations,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDonationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['received', 'verified', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Valid donation status is required' });
    }

    const donation = await Donation.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    res.json({ success: true, message: 'Donation status updated', data: donation });
  } catch (error) {
    next(error);
  }
};
