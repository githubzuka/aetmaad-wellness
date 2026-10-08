import React, { useEffect, useState, useCallback } from 'react';
import {
  Mail, Phone, Search, RefreshCw, X, Inbox, Clock,
  CheckCircle2, CircleDot, Loader2, Send
} from 'lucide-react';
import contactService from '../../services/contactService';
import './AdminContacts.css';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

const CATEGORY_LABELS = {
  general: 'General',
  order: 'Order',
  volunteer: 'Volunteer',
  donation: 'Donation',
  complaint: 'Complaint',
};

const AdminContacts = ({ onAction }) => {
  const [contacts, setContacts] = useState([]);
  const [counts, setCounts] = useState({ total: 0, new: 0, in_progress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const loadContacts = useCallback(async (status = statusFilter, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await contactService.getAdminContacts(status);
      if (res?.success) {
        setContacts(res.data || []);
        if (res.counts) setCounts(res.counts);
      }
    } catch (err) {
      console.error('Failed to load contact enquiries:', err);
      if (onAction) onAction({ type: 'error', text: err.message || 'Unable to load enquiries.' });
    } finally {
      if (!silent) setLoading(false);
    }
  }, [statusFilter, onAction]);

  useEffect(() => {
    loadContacts(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openContact = (contact) => {
    setSelected(contact);
    setNote(contact.adminNote || '');
  };

  const updateStatus = async (contact, status) => {
    setSaving(true);
    try {
      const res = await contactService.updateContact(contact._id, { status, adminNote: note });
      if (res?.success) {
        setContacts((prev) => prev.map((c) => (c._id === contact._id ? res.data : c)));
        if (selected && selected._id === contact._id) setSelected(res.data);
        setCounts((prev) => ({ ...prev, [status]: (prev[status] || 0) + 1 }));
        if (onAction) onAction({ type: 'success', text: `Enquiry marked as ${status.replace('_', ' ')}.` });
      }
    } catch (err) {
      if (onAction) onAction({ type: 'error', text: err.message || 'Could not update the enquiry.' });
    } finally {
      setSaving(false);
    }
  };

  const saveNote = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await contactService.updateContact(selected._id, { adminNote: note });
      if (res?.success) {
        setContacts((prev) => prev.map((c) => (c._id === selected._id ? res.data : c)));
        setSelected(res.data);
        if (onAction) onAction({ type: 'success', text: 'Internal note saved.' });
      }
    } catch (err) {
      if (onAction) onAction({ type: 'error', text: err.message || 'Could not save the note.' });
    } finally {
      setSaving(false);
    }
  };

  const filtered = contacts.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.subject?.toLowerCase().includes(q) ||
      c.message?.toLowerCase().includes(q)
    );
  });

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : '—');

  return (
    <div className="admin-contacts-desk">
      <div className="desk-header admin-contacts-header">
        <div>
          <h2>Contact &amp; Outreach Enquiries ({counts.total})</h2>
          <p>Everyone reaching out from the public site. Open an enquiry to read the full message and update its status.</p>
        </div>
        <button className="btn-contacts-refresh" onClick={() => loadContacts(statusFilter)}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary tiles */}
      <div className="contacts-stats-row">
        <div className="contact-stat new">
          <CircleDot size={18} />
          <div><span>{counts.new}</span><small>New</small></div>
        </div>
        <div className="contact-stat progress">
          <Clock size={18} />
          <div><span>{counts.in_progress}</span><small>In Progress</small></div>
        </div>
        <div className="contact-stat resolved">
          <CheckCircle2 size={18} />
          <div><span>{counts.resolved}</span><small>Resolved</small></div>
        </div>
        <div className="contact-stat total">
          <Inbox size={18} />
          <div><span>{counts.total}</span><small>Total</small></div>
        </div>
      </div>

      {/* Filters */}
      <div className="contacts-toolbar">
        <div className="contacts-tabs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`contacts-tab ${statusFilter === tab.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.value)}
            >
              {tab.label}
              {tab.value !== 'all' && counts[tab.value] > 0 && (
                <span className="contacts-tab-count">{counts[tab.value]}</span>
              )}
            </button>
          ))}
        </div>

        <div className="contacts-search">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search name, email, subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="contacts-empty"><Loader2 size={20} className="spin" /> Loading enquiries…</div>
      ) : filtered.length === 0 ? (
        <div className="contacts-empty">
          <Inbox size={38} />
          <h3>No enquiries found</h3>
          <p>{search ? `Nothing matches “${search}”.` : 'New contact submissions will appear here.'}</p>
        </div>
      ) : (
        <div className="contacts-list">
          {filtered.map((c) => (
            <button
              type="button"
              key={c._id}
              className={`contact-row status-${c.status}`}
              onClick={() => openContact(c)}
            >
              <div className="contact-row-main">
                <div className="contact-row-top">
                  <strong>{c.name}</strong>
                  <span className={`contact-cat ${c.category}`}>{CATEGORY_LABELS[c.category] || 'General'}</span>
                </div>
                <span className="contact-row-subject">{c.subject}</span>
                <p className="contact-row-preview">{c.message}</p>
                <div className="contact-row-meta">
                  <span><Mail size={11} /> {c.email}</span>
                  {c.phone && <span><Phone size={11} /> {c.phone}</span>}
                  <span><Clock size={11} /> {formatDate(c.createdAt)}</span>
                </div>
              </div>
              <span className={`contact-status ${c.status}`}>
                {c.status.replace('_', ' ').toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="contacts-modal-overlay" role="presentation" onClick={() => setSelected(null)}>
          <div className="contacts-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="contacts-modal-header">
              <div className="contacts-modal-heading">
                <div className="contacts-modal-icon"><Mail size={20} /></div>
                <div>
                  <h3>{selected.subject}</h3>
                  <p>{selected.name} • {formatDate(selected.createdAt)}</p>
                </div>
              </div>
              <button type="button" className="contacts-icon-btn" onClick={() => setSelected(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="contacts-modal-body">
              <div className="contacts-detail-grid">
                <div className="contacts-detail">
                  <span className="contacts-detail-label">Email</span>
                  <a href={`mailto:${selected.email}`} className="contacts-detail-value link">{selected.email}</a>
                </div>
                <div className="contacts-detail">
                  <span className="contacts-detail-label">Phone</span>
                  <span className="contacts-detail-value">{selected.phone || '—'}</span>
                </div>
                <div className="contacts-detail">
                  <span className="contacts-detail-label">Category</span>
                  <span className={`contact-cat ${selected.category}`}>
                    {CATEGORY_LABELS[selected.category] || 'General'}
                  </span>
                </div>
                <div className="contacts-detail">
                  <span className="contacts-detail-label">Status</span>
                  <span className={`contact-status ${selected.status}`}>
                    {selected.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="contacts-message-block">
                <h4>Message</h4>
                <p>{selected.message}</p>
              </div>

              <div className="contacts-note-block">
                <h4>Internal note (team only)</h4>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add context or a record of how this was handled…"
                />
                <button type="button" className="contacts-save-note" onClick={saveNote} disabled={saving}>
                  <Send size={13} /> {saving ? 'Saving…' : 'Save Note'}
                </button>
              </div>

              {selected.resolvedAt && (
                <div className="contacts-resolved-info">
                  <CheckCircle2 size={14} /> Resolved on {formatDate(selected.resolvedAt)}
                </div>
              )}
            </div>

            <div className="contacts-modal-actions">
              <button
                type="button"
                className="contacts-action progress"
                onClick={() => updateStatus(selected, 'in_progress')}
                disabled={saving || selected.status === 'in_progress'}
              >
                <Clock size={14} /> Mark In Progress
              </button>
              <button
                type="button"
                className="contacts-action resolve"
                onClick={() => updateStatus(selected, 'resolved')}
                disabled={saving || selected.status === 'resolved'}
              >
                <CheckCircle2 size={14} /> Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
