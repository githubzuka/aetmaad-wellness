import React, { useState } from 'react';
import { CalendarPlus, X } from 'lucide-react';
import eventService from '../../services/eventService';
import './EventProposalForm.css'; // Importing the CSS file

const EventProposalForm = ({ onAction }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    date: '', 
    time: '', 
    location: '', 
    city: '', 
    organizer: '' 
  });

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
      <button className="btn-add-shop-secondary" onClick={() => setOpen(true)}>
        <CalendarPlus size={18} />
        <span>Propose an Event</span>
      </button>

      {open && (
        <div className="vol-modal-overlay" onClick={() => setOpen(false)}>
          <div 
            className="vol-modal-card event-proposal-card" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="vol-modal-header">
              <h3>Propose an ASHVA Event</h3>
              <button 
                className="btn-close-modal" 
                onClick={() => setOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <p className="event-proposal-help">
              Suggest a local welfare drive, community gathering, or working-horse initiative. The admin team will review it before publication.
            </p>

            <form onSubmit={handleSubmit} className="vol-modal-form">
              <div className="form-group">
                <input 
                  type="text"
                  placeholder="Event title *" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-group">
                <input 
                  type="text"
                  placeholder="Organizer / Organization name *" 
                  value={form.organizer} 
                  onChange={(e) => setForm({ ...form, organizer: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-group">
                <textarea 
                  placeholder="Describe the event *" 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  rows={3}
                  required 
                />
              </div>

              {/* 2-column layout on tablet/desktop, stacked on mobile */}
              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">Date</label>
                  <input 
                    type="date" 
                    value={form.date} 
                    onChange={(e) => setForm({ ...form, date: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="input-label">Time</label>
                  <input 
                    type="time" 
                    value={form.time} 
                    onChange={(e) => setForm({ ...form, time: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <input 
                    type="text"
                    placeholder="Location / Address *" 
                    value={form.location} 
                    onChange={(e) => setForm({ ...form, location: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="text"
                    placeholder="City / Zone *" 
                    value={form.city} 
                    onChange={(e) => setForm({ ...form, city: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button className="btn-add-shop-main" type="submit">
                  Send for Admin Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EventProposalForm;