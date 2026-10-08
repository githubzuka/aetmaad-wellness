import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle, CheckCircle2, MessageSquarePlus, Store, Calendar } from 'lucide-react';
import shopService from '../../services/shopService';
import './WeeklyFeedbackModal.css';

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active & Operating' },
  { value: 'Inventory Low', label: 'Inventory Low' },
  { value: 'Needs Restock', label: 'Needs Urgent Restock' },
  { value: 'Closed Temporarily', label: 'Closed Temporarily' },
];

const WeeklyFeedbackModal = ({ isOpen, onClose, shop, onSuccess }) => {
  const [status, setStatus] = useState('Active');
  const [suppliesNote, setSuppliesNote] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Reset the form each time the modal opens for a (possibly different) shop
  useEffect(() => {
    if (isOpen) {
      setStatus(shop?.status || 'Active');
      setSuppliesNote('');
      setNotes('');
      setError(null);
      setSuccessMsg(null);
      setLoading(false);
    }
  }, [isOpen, shop]);

  // Close on Escape + lock background scroll while open
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !shop) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await shopService.submitShopFeedback(shop._id, {
        status,
        suppliesNote: suppliesNote.trim(),
        notes: notes.trim(),
      });

      if (res && res.success) {
        setSuccessMsg(`Weekly feedback submitted for ${shop.name}. Admin notified & timer reset.`);
        setTimeout(() => {
          if (onSuccess) onSuccess(res.shopLastUpdated || new Date());
          onClose();
        }, 1100);
      } else {
        setError(res?.message || 'Failed to submit weekly feedback.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error submitting feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="feedback-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="feedback-modal-header">
          <div className="feedback-modal-heading">
            <div className="feedback-modal-icon">
              <MessageSquarePlus size={20} />
            </div>
            <div>
              <h2 id="feedback-modal-title">Weekly Shop Feedback</h2>
              <p>Submitting update for <strong>{shop.name}</strong></p>
            </div>
          </div>

          <button type="button" className="feedback-modal-close" onClick={onClose} aria-label="Close feedback form">
            <X size={18} />
          </button>
        </div>

        {/* Shop summary */}
        <div className="feedback-shop-summary">
          <div className="feedback-summary-row">
            <Store size={14} className="feedback-summary-icon" />
            <span>{shop.name} — {shop.city}</span>
          </div>
          <div className="feedback-summary-row">
            <Calendar size={14} className="feedback-summary-icon" />
            <span>
              Last updated:{' '}
              {shop.lastUpdated ? new Date(shop.lastUpdated).toLocaleDateString() : 'Never'}
            </span>
          </div>
        </div>

        {error && (
          <div className="feedback-alert error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="feedback-alert success" role="status">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="feedback-modal-form">
          <div className="feedback-field">
            <label htmlFor="feedback-status">
              Shop Operating Status <span className="req">*</span>
            </label>
            <select
              id="feedback-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="feedback-field">
            <label htmlFor="feedback-supplies">Feed &amp; Nutrition Stock Notes</label>
            <textarea
              id="feedback-supplies"
              rows={3}
              value={suppliesNote}
              onChange={(e) => setSuppliesNote(e.target.value)}
              placeholder="e.g. ASHVA Mix stock at 15 bags. High demand for working-horse feed blend…"
            />
          </div>

          <div className="feedback-field">
            <label htmlFor="feedback-notes">General Observations &amp; Issues Faced</label>
            <textarea
              id="feedback-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail any vendor concerns, local animal care feedback, or delivery delays…"
            />
          </div>

          <div className="feedback-modal-actions">
            <button type="button" className="btn-feedback-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-feedback-submit" disabled={loading}>
              <Send size={14} />
              <span>{loading ? 'Submitting…' : 'Submit Feedback & Reset Timer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WeeklyFeedbackModal;

