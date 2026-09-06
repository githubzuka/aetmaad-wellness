import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2, MessageSquarePlus } from 'lucide-react';
import shopService from '../../services/shopService';

const WeeklyFeedbackModal = ({ isOpen, onClose, shop, onSuccess }) => {
  const [status, setStatus] = useState('Active');
  const [suppliesNote, setSuppliesNote] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen || !shop) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        status,
        suppliesNote,
        notes,
      };

      const res = await shopService.submitShopFeedback(shop._id, payload);

      if (res && res.success) {
        setSuccessMsg(`Weekly feedback submitted for ${shop.name}!`);
        setTimeout(() => {
          if (onSuccess) onSuccess(res.shopLastUpdated || new Date());
          onClose();
        }, 1200);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <MessageSquarePlus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 leading-tight">Weekly Shop Feedback</h2>
              <p className="text-xs text-stone-500 font-medium">Submitting update for <strong>{shop.name}</strong></p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Shop Status Select */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Shop Operating Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-stone-800 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all"
            >
              <option value="Active">🟢 Active & Operating</option>
              <option value="Inventory Low">🟡 Inventory Low</option>
              <option value="Needs Restock">🔴 Needs Urgent Restock</option>
              <option value="Closed Temporarily">⚪ Closed Temporarily</option>
            </select>
          </div>

          {/* Stock & Supplies Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Feed & Nutrition Stock Notes
            </label>
            <textarea
              rows={3}
              value={suppliesNote}
              onChange={(e) => setSuppliesNote(e.target.value)}
              placeholder="e.g. ASHVA Mix stocks at 15 bags. High demand for Working Horse feed blend..."
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs font-normal text-stone-800 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all"
            />
          </div>

          {/* General Notes & Issues */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              General Observations & Issues Faced
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail any vendor concerns, local animal care feedback, or delivery delays..."
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs font-normal text-stone-800 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Send size={14} />
              <span>{loading ? 'Submitting...' : 'Submit Feedback & Reset Timer'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default WeeklyFeedbackModal;
