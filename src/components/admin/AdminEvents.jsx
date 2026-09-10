import React, { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle, XCircle, Trash2, Plus } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import './AdminEvents.css';

const emptyForm = { title: '', description: '', date: '', time: '', location: '', city: '', organizer: 'ASHVA Wellness Team' };

const AdminEvents = ({ onAction }) => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const priorityOrder = { pending: 0, approved: 1, rejected: 2 };

  const loadEvents = async () => {
    try {
      const response = await axiosClient.get('/api/admin/events');
      setEvents((response.data.data || []).sort((first, second) => {
        const priorityDifference = priorityOrder[first.status] - priorityOrder[second.status];
        if (priorityDifference !== 0) return priorityDifference;
        return new Date(first.date) - new Date(second.date);
      }));
    } catch (error) {
      onAction({ type: 'error', text: error.message || 'Unable to load events' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/api/admin/events', form);
      setForm(emptyForm);
      setShowForm(false);
      onAction({ type: 'success', text: 'Event details added successfully and published on the official website.' });
      loadEvents();
    } catch (error) {
      onAction({ type: 'error', text: error.message || 'Unable to publish event' });
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosClient.patch(`/api/admin/events/${id}/status`, { status });
      onAction({ type: 'success', text: `Event ${status}.` });
      loadEvents();
    } catch (error) {
      onAction({ type: 'error', text: error.message || 'Unable to update event' });
    }
  };

  const removeEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await axiosClient.delete(`/api/admin/events/${id}`);
      onAction({ type: 'success', text: 'Event deleted.' });
      loadEvents();
    } catch (error) {
      onAction({ type: 'error', text: error.message || 'Unable to delete event' });
    }
  };

  return (
    <div className="admin-events-desk">
      <div className="desk-header admin-events-header">
        <div><h2>ASHVA Events ({events.length})</h2><p>Review pending proposals first, then manage published event details.</p></div>
        <button className="btn-event-primary" onClick={() => setShowForm((current) => !current)}><Plus size={16} /> Add Event</button>
      </div>

      {showForm && (
        <form className="event-admin-form" onSubmit={handleSubmit}>
          <input placeholder="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea placeholder="What is this event about?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div className="event-form-grid">
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            <input placeholder="Time (e.g. 10:00 AM - 2:00 PM)" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
            <input placeholder="City / Zone" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          </div>
          <input placeholder="Organizer" value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} required />
          <button className="btn-event-primary" type="submit"><CalendarDays size={16} /> Publish Event</button>
        </form>
      )}

      {loading ? <div className="events-admin-empty">Loading events...</div> : events.length === 0 ? <div className="events-admin-empty">No events added yet.</div> : (
        <div className="admin-events-list">
          {events.map((event) => (
            <div className="admin-event-row" key={event._id}>
              <div><strong>{event.title}</strong><span>{new Date(event.date).toLocaleDateString()} • {event.city} • {event.location}</span><small>Hosted by {event.organizer}{event.volunteerHostName ? ` • Volunteer: ${event.volunteerHostName}` : ''}</small></div>
              <span className={`status-pill ${event.status}`}>{event.status.toUpperCase()}</span>
              <div className="admin-event-actions">
                {event.status !== 'approved' && <button className="event-icon-btn approve" title="Approve event" onClick={() => updateStatus(event._id, 'approved')}><CheckCircle size={17} /></button>}
                {event.status !== 'rejected' && <button className="event-icon-btn reject" title="Reject event" onClick={() => updateStatus(event._id, 'rejected')}><XCircle size={17} /></button>}
                <button className="event-icon-btn delete" title="Delete event" onClick={() => removeEvent(event._id)}><Trash2 size={17} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
