import Contact from '../models/Contact.js';
import Notification from '../models/Notification.js';
import { logSecurityEvent } from '../utils/securityLog.js';
import { createNotificationDeduped } from './notificationController.js';

/**
 * @desc    Submit a public contact / outreach enquiry
 * @route   POST /api/contact
 * @access  Public
 */
export const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, category, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required.' });
    }

    const enquiry = await Contact.create({
      name: String(name).trim().slice(0, 120),
      email: String(email).trim().toLowerCase(),
      phone: String(phone || '').trim().slice(0, 30),
      subject: String(subject || 'General Enquiry').trim().slice(0, 200),
      category: ['general', 'order', 'volunteer', 'donation', 'complaint'].includes(category)
        ? category
        : 'general',
      message: String(message).trim().slice(0, 3000),
      submittedIp: req.ip || '',
      userAgent: String(req.headers['user-agent'] || '').slice(0, 300),
    });

    // Alert the admin team. Identical repeats collapse into a single entry
    // showing an "×N" counter instead of flooding the notification centre.
    await createNotificationDeduped({
      user: null,
      title: `New Contact Enquiry — ${enquiry.subject}`,
      message: `${enquiry.name} (${enquiry.email}) reached out: "${enquiry.subject}".`,
      type: 'general',
      referenceId: enquiry._id,
      metadata: {
        contactId: enquiry._id,
        category: enquiry.category,
        email: enquiry.email,
      },
    });

    // Basic spam signal: same email submitting very frequently
    const recentCount = await Contact.countDocuments({
      email: enquiry.email,
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
    });
    if (recentCount >= 5) {
      await logSecurityEvent({
        severity: 'medium',
        kind: 'contact_spam',
        title: 'Possible Contact Form Spam',
        message: `${enquiry.email} submitted ${recentCount} enquiries within 10 minutes.`,
        metadata: { email: enquiry.email, count: recentCount },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out. Our team will respond within 24 hours.',
      data: { _id: enquiry._id, createdAt: enquiry.createdAt },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: list all contact enquiries
 * @route   GET /api/admin/contacts
 * @access  Private (Admin)
 */
export const getAdminContacts = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status && ['new', 'in_progress', 'resolved'].includes(status) ? { status } : {};

    const contacts = await Contact.find(query)
      .sort({ status: 1, createdAt: -1 })
      .lean();

    const counts = {
      total: await Contact.countDocuments({}),
      new: await Contact.countDocuments({ status: 'new' }),
      in_progress: await Contact.countDocuments({ status: 'in_progress' }),
      resolved: await Contact.countDocuments({ status: 'resolved' }),
    };

    res.json({ success: true, count: contacts.length, counts, data: contacts });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: update the status / note on an enquiry
 * @route   PATCH /api/admin/contacts/:id
 * @access  Private (Admin)
 */
export const updateContactStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;

    if (status && !['new', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Valid status required (new, in_progress, resolved)' });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Enquiry not found' });

    if (status) contact.status = status;
    if (adminNote !== undefined) contact.adminNote = String(adminNote).slice(0, 2000);

    if (status === 'resolved') {
      contact.resolvedBy = req.user._id;
      contact.resolvedAt = new Date();
    }

    await contact.save();

    res.json({ success: true, message: 'Enquiry updated', data: contact });
  } catch (error) {
    next(error);
  }
};