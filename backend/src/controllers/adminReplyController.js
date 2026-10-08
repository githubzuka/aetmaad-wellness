import AdminReply from '../models/AdminReply.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * @desc    Admin opens (or continues) a conversation with a volunteer about an event
 * @route   POST /api/admin/replies
 * @access  Private (Admin)
 */
export const createAdminReply = async (req, res, next) => {
  try {
    const { eventId, volunteerId, kind = 'general', subject = '', body } = req.body;

    if (!body || !String(body).trim()) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    let resolvedVolunteerId = volunteerId;

    // When the admin replies from an event proposal, derive the volunteer
    // from the event itself so the admin cannot mis-address the thread.
    if (eventId) {
      const event = await Event.findById(eventId).select('createdBy title');
      if (!event) return res.status(404).json({ message: 'Event not found' });
      resolvedVolunteerId = event.createdBy;
    }

    if (!resolvedVolunteerId) {
      return res.status(400).json({ message: 'A target volunteer is required' });
    }

    const volunteer = await User.findOne({
      _id: resolvedVolunteerId,
      role: 'volunteer',
      status: 'approved',
    });

    if (!volunteer) {
      return res.status(400).json({
        message: 'The target volunteer is not an approved volunteer, so they cannot be messaged.',
      });
    }

    const adminName = req.user.name || 'ASHVA Admin';
    const message = {
      sender: req.user._id,
      senderRole: 'admin',
      senderName: adminName,
      body: String(body).trim(),
      createdAt: new Date(),
    };

    // Continue an existing open thread for this event, otherwise start one
    let thread = eventId
      ? await AdminReply.findOne({ event: eventId, volunteer: resolvedVolunteerId, status: 'open' })
      : null;

    if (thread) {
      thread.messages.push(message);
      thread.admin = req.user._id;
      thread.kind = kind;
      if (subject) thread.subject = subject;
      thread.lastActivityAt = new Date();
      await thread.save();
    } else {
      thread = await AdminReply.create({
        event: eventId || null,
        volunteer: resolvedVolunteerId,
        admin: req.user._id,
        kind,
        subject,
        messages: [message],
      });
    }

    // Push the reply into the volunteer's notification feed
    const kindTitles = {
      more_details: 'Admin Needs More Details',
      approved_note: 'Admin Note On Your Event',
      rejected_note: 'Admin Update On Your Event',
      general: 'Message From ASHVA Admin',
    };

    await Notification.create({
      user: resolvedVolunteerId,
      title: kindTitles[kind] || kindTitles.general,
      message: `${adminName}: ${message.body}`,
      type: 'general',
      referenceId: thread._id,
      metadata: {
        adminReplyId: thread._id,
        volunteerId: resolvedVolunteerId,
        eventId: eventId || null,
        kind,
        threadSubject: subject || '',
      },
    });

    // Also surface it to other admins so the conversation is auditable
    await Notification.create({
      user: null,
      title: 'Admin Reply Sent To Volunteer',
      message: `${adminName} replied to ${volunteer.name}${subject ? ` about "${subject}"` : ''}.`,
      type: 'general',
      referenceId: thread._id,
      metadata: { adminReplyId: thread._id, volunteerId: resolvedVolunteerId, eventId: eventId || null },
    });

    res.status(201).json({ success: true, message: 'Reply sent to volunteer', data: thread });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Threaded replies between an admin and a specific volunteer
 * @route   GET /api/admin/replies?volunteerId=...
 * @access  Private (Admin)
 */
export const getAdminReplies = async (req, res, next) => {
  try {
    const { volunteerId } = req.query;
    const query = volunteerId ? { volunteer: volunteerId } : {};

    const threads = await AdminReply.find(query)
      .populate('volunteer', 'name email city status')
      .populate('event', 'title status date city')
      .sort({ lastActivityAt: -1 });

    res.json({ success: true, count: threads.length, data: threads });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Threads + messages addressed to the logged-in volunteer
 * @route   GET /api/replies/my
 * @access  Private (Volunteer)
 */
export const getMyReplies = async (req, res, next) => {
  try {
    const threads = await AdminReply.find({ volunteer: req.user._id })
      .populate('event', 'title status date city')
      .sort({ lastActivityAt: -1 });

    res.json({ success: true, count: threads.length, data: threads });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Volunteer replies back inside an existing thread
 * @route   POST /api/replies/:id/message
 * @access  Private (Volunteer)
 */
export const volunteerReplyToThread = async (req, res, next) => {
  try {
    const { body } = req.body;

    if (!body || !String(body).trim()) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    const thread = await AdminReply.findOne({
      _id: req.params.id,
      volunteer: req.user._id,
    });

    if (!thread) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const message = {
      sender: req.user._id,
      senderRole: 'volunteer',
      senderName: req.user.name || 'Volunteer',
      body: String(body).trim(),
      createdAt: new Date(),
    };

    thread.messages.push(message);
    thread.status = 'open';
    thread.lastActivityAt = new Date();
    await thread.save();

    const volunteerName = req.user.name || 'Volunteer';

    // Notify admins about the volunteer's response
    await Notification.create({
      user: null,
      title: 'Volunteer Replied To Admin',
      message: `${volunteerName} replied: ${message.body}`,
      type: 'general',
      referenceId: thread._id,
      metadata: {
        adminReplyId: thread._id,
        volunteerId: req.user._id,
        eventId: thread.event || null,
      },
    });

    res.json({ success: true, message: 'Reply sent to admin', data: thread });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin closes a conversation thread
 * @route   PATCH /api/admin/replies/:id/close
 * @access  Private (Admin)
 */
export const closeAdminReply = async (req, res, next) => {
  try {
    const thread = await AdminReply.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: 'Conversation not found' });

    thread.status = 'closed';
    thread.lastActivityAt = new Date();
    await thread.save();

    res.json({ success: true, message: 'Conversation closed', data: thread });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: list approved volunteers available for direct messaging
 * @route   GET /api/admin/messageable-volunteers
 * @access  Private (Admin)
 */
export const getMessageableVolunteers = async (req, res, next) => {
  try {
    // Only approved volunteers can be messaged
    const volunteers = await User.find({ role: 'volunteer', status: 'approved' })
      .select('name email city contactNumber')
      .sort({ name: 1 })
      .lean();

    res.json({ success: true, count: volunteers.length, data: volunteers });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: start a direct (non-event) conversation with a volunteer
 * @route   POST /api/admin/messages
 * @access  Private (Admin)
 */
export const sendDirectMessage = async (req, res, next) => {
  try {
    const { volunteerId, subject = 'Message from ASHVA Admin', body } = req.body;

    if (!volunteerId) {
      return res.status(400).json({ message: 'Please choose a volunteer to message.' });
    }
    if (!body || !String(body).trim()) {
      return res.status(400).json({ message: 'Message body is required.' });
    }

    const volunteer = await User.findOne({
      _id: volunteerId,
      role: 'volunteer',
      status: 'approved',
    });

    if (!volunteer) {
      return res.status(400).json({
        message: 'Only approved volunteers can be messaged.',
      });
    }

    const adminName = req.user.name || 'ASHVA Admin';
    const now = new Date();

    const thread = await AdminReply.create({
      event: null,
      volunteer: volunteer._id,
      admin: req.user._id,
      kind: 'direct',
      subject,
      messages: [
        {
          sender: req.user._id,
          senderRole: 'admin',
          senderName: adminName,
          body: String(body).trim(),
          createdAt: now,
        },
      ],
      lastActivityAt: now,
    });

    // Notify the volunteer
    await Notification.create({
      user: volunteer._id,
      title: subject || 'Message From ASHVA Admin',
      message: `${adminName}: ${String(body).trim()}`,
      type: 'general',
      referenceId: thread._id,
      metadata: {
        adminReplyId: thread._id,
        volunteerId: volunteer._id,
        kind: 'direct',
        threadSubject: subject,
      },
    });

    // Record the outgoing message in the admin audit trail
    await Notification.create({
      user: null,
      title: 'Admin Message Sent To Volunteer',
      message: `${adminName} messaged ${volunteer.name}${subject ? ` — "${subject}"` : ''}.`,
      type: 'general',
      referenceId: thread._id,
      metadata: {
        adminReplyId: thread._id,
        volunteerId: volunteer._id,
        volunteerName: volunteer.name,
        kind: 'direct_message',
        subject,
      },
    });

    res.status(201).json({ success: true, message: `Message sent to ${volunteer.name}.`, data: thread });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: full audit trail of everything that came in, what the admin
 *          decided, and how the volunteer responded.
 *          Includes notification history, approval decisions and message threads.
 * @route   GET /api/admin/audit-trail
 * @access  Private (Admin)
 */
export const getAuditTrail = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 60, 200);

    // Notification history (what came in / what admin sent)
    const notifications = await Notification.find({
      $or: [
        { user: req.user._id },
        { user: null },
        { user: { $exists: false } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Volunteer approval decisions are recorded as status transitions on the
    // user record; surface approved/rejected volunteers with their timestamps.
    const decidedVolunteers = await User.find({
      role: 'volunteer',
      status: { $in: ['approved', 'rejected'] },
    })
      .select('name email city status updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    // Message threads give us both the admin message and the volunteer response
    const threads = await AdminReply.find({})
      .populate('volunteer', 'name email city')
      .populate('event', 'title status city')
      .sort({ lastActivityAt: -1 })
      .limit(limit)
      .lean();

    // Build a unified, chronological audit feed
    const events = [];

    notifications.forEach((n) => {
      events.push({
        id: `notif-${n._id}`,
        at: n.createdAt,
        source: 'notification',
        type: n.type,
        title: n.title,
        detail: n.message,
        seen: Boolean(n.read || n.isRead),
        meta: n.metadata || {},
      });
    });

    decidedVolunteers.forEach((v) => {
      events.push({
        id: `decision-${v._id}`,
        at: v.updatedAt || v.createdAt,
        source: 'decision',
        type: v.status === 'approved' ? 'volunteer_approved' : 'volunteer_rejected',
        title: `Volunteer ${v.status === 'approved' ? 'Approved' : 'Rejected'}`,
        detail: `${v.name} (${v.email}) — ${v.city || 'Zone not set'}`,
        seen: true,
        meta: { volunteerId: v._id, volunteerName: v.name, status: v.status },
      });
    });

    threads.forEach((t) => {
      (t.messages || []).forEach((m) => {
        events.push({
          id: `msg-${t._id}-${m._id || m.createdAt}`,
          at: m.createdAt,
          source: m.senderRole === 'admin' ? 'admin_message' : 'volunteer_response',
          type: m.senderRole === 'admin' ? 'admin_message' : 'volunteer_response',
          title: m.senderRole === 'admin' ? 'Admin Message Sent' : 'Volunteer Responded',
          detail: m.body,
          seen: true,
          meta: {
            adminReplyId: t._id,
            volunteerId: t.volunteer?._id,
            volunteerName: t.volunteer?.name || m.senderName,
            eventId: t.event?._id || null,
            eventTitle: t.event?.title || null,
            subject: t.subject || '',
            kind: t.kind || 'general',
          },
        });
      });
    });

    events.sort((a, b) => new Date(b.at) - new Date(a.at));

    res.json({
      success: true,
      count: events.length,
      counts: {
        total: events.length,
        notifications: notifications.length,
        decisions: decidedVolunteers.length,
        messages: threads.reduce((sum, t) => sum + (t.messages?.length || 0), 0),
      },
      data: events.slice(0, limit),
    });
  } catch (error) {
    next(error);
  }
};
