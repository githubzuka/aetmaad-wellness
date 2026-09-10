import React, { useState } from 'react';
import { CalendarPlus, X } from 'lucide-react';
import eventService from '../../services/eventService';

const EventProposalForm = ({ onAction }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '', time: '', location: '', city: '', organizer: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await eventService.proposeEvent(form);
      setForm({ title: '', description: '', date: '', time: '', location: '', city: '', organizer: '' });
      setOpen(false);
      onAction({ type: 'success', text: 'Event proposal sent to the admin team for approval.' });
    } catch (error) {
      onAction({ type: 'error', text: error.message || 'Unable to submit event proposal.' });
    }
  };

  return (
    <>
      <button className="btn-add-shop-secondary" onClick={() => setOpen(true)}><CalendarPlus size={16} /> Propose an Event</button>
      {open && (
        <div className="vol-modal-overlay">
          <div className="vol-modal-card event-proposal-card">
            <div className="vol-modal-header"><h3>Propose an ASHVA Event</h3><button className="btn-close-modal" onClick={() => setOpen(false)}><X size={20} /></button></div>
            <p className="event-proposal-help">Suggest a local welfare drive, community gathering, or working-horse initiative. The admin team will review it before publication.</p>
            <form onSubmit={handleSubmit} className="vol-modal-form">
              <input placeholder="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <textarea placeholder="Describe the event" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              <input placeholder="Time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
              <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
              <input placeholder="City / Zone" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              <button className="btn-add-shop-main" type="submit">Send for Admin Approval</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EventProposalForm;
