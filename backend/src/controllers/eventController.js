import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const eventFields = 'title description date time location city organizer volunteerHostName status source volunteerResponse createdBy createdAt';

export const getUpcomingEvents = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const events = await Event.find({ status: 'approved', date: { $gte: today } })
      .select(eventFields)
      .sort({ date: 1 });

    res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};

export const getAdminEvents = async (req, res, next) => {
  try {
    const events = await Event.find().populate('createdBy', 'name email').sort({ status: 1, date: 1 });
    res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};

const validateEvent = (body, includeOrganizer = true) => {
  const requiredFields = ['title', 'description', 'date', 'time', 'location', 'city'];
  if (includeOrganizer) requiredFields.push('organizer');
  return requiredFields.find((field) => !body[field]);
};

export const createAdminEvent = async (req, res, next) => {
  try {
    const missingField = validateEvent(req.body);
    if (missingField) return res.status(400).json({ message: `${missingField} is required` });

    const event = await Event.create({
      ...req.body,
      status: 'approved',
      source: 'admin',
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Event published successfully', data: event });
  } catch (error) {
    next(error);
  }
};

export const proposeVolunteerEvent = async (req, res, next) => {
  try {
    const missingField = validateEvent(req.body, false);
    if (missingField) return res.status(400).json({ message: `${missingField} is required` });

    const event = await Event.create({
      ...req.body,
      status: 'pending',
      source: 'volunteer',
      createdBy: req.user._id,
      organizer: req.user.name,
    });

    await Notification.create({
      user: null,
      title: 'New Event Proposal',
      message: `${req.user.name} proposed the event “${event.title}” for admin approval.`,
      type: 'event_proposal',
      referenceId: event._id,
      metadata: { eventId: event._id, volunteerId: req.user._id },
    });

    res.status(201).json({ success: true, message: 'Event proposal submitted for admin approval', data: event });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    Object.assign(event, req.body);
    await event.save();
    res.json({ success: true, message: 'Event updated successfully', data: event });
  } catch (error) {
    next(error);
  }
};

export const updateEventStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Valid event status is required' });
    }

    const existingEvent = await Event.findById(req.params.id).populate('createdBy', 'name email');
    if (!existingEvent) return res.status(404).json({ message: 'Event not found' });

    const wasApproved = existingEvent.status === 'approved';
    existingEvent.status = status;
    if (status === 'approved' && existingEvent.source === 'volunteer') {
      existingEvent.organizer = 'ASHVA Wellness Team';
      existingEvent.volunteerHostName = existingEvent.createdBy?.name || '';
    }
    const event = await existingEvent.save();

    if (status === 'approved' && !wasApproved) {
      if (event.source === 'volunteer') {
        await Notification.create({
          user: event.createdBy,
          title: 'Your Event Proposal Was Approved',
          message: `Your event “${event.title}” was approved. Details: ${new Date(event.date).toLocaleDateString('en-IN')} at ${event.time}, ${event.location}, ${event.city}. Please confirm whether you agree to host this event.`,
          type: 'event_upcoming',
          referenceId: event._id,
          metadata: { eventId: event._id, requiresResponse: true, city: event.city },
        });
      }

      const volunteers = await User.find({
        role: 'volunteer',
        status: 'approved',
      }).select('_id');

      if (volunteers.length > 0) {
        await Notification.insertMany(volunteers.map((volunteer) => ({
          user: volunteer._id,
          title: 'New ASHVA Event Approved',
          message: `${event.title} is coming up on ${new Date(event.date).toLocaleDateString('en-IN')} at ${event.location}.`,
          type: 'event_upcoming',
          referenceId: event._id,
          metadata: { eventId: event._id, city: event.city },
        })));
      }
    }

    res.json({ success: true, message: `Event ${status}`, data: event });
  } catch (error) {
    next(error);
  }
};

export const respondToVolunteerEvent = async (req, res, next) => {
  try {
    const { response } = req.body;
    if (!['agreed', 'disagreed'].includes(response)) {
      return res.status(400).json({ message: 'Response must be agreed or disagreed' });
    }

    const event = await Event.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      source: 'volunteer',
      status: 'approved',
    });

    if (!event) {
      return res.status(404).json({ message: 'Approved volunteer event not found' });
    }

    event.volunteerResponse = response;
    await event.save();

    await Notification.create({
      user: null,
      title: `Volunteer ${response === 'agreed' ? 'Agreed' : 'Disagreed'} With Event`,
      message: `${req.user.name} ${response === 'agreed' ? 'agreed' : 'disagreed'} with hosting “${event.title}”.`,
      type: 'event_proposal',
      referenceId: event._id,
      metadata: { eventId: event._id, volunteerId: req.user._id, response },
    });

    res.json({ success: true, message: `Event response recorded as ${response}`, data: event });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};
