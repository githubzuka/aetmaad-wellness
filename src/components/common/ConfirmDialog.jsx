import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmDialog.css';

/**
 * Reusable confirmation dialog. Replaces window.confirm so destructive
 * actions are styled consistently and are usable on mobile.
 *
 * <ConfirmDialog
 *   open={bool}
 *   tone="danger"           // 'danger' | 'warning' | 'default'
 *   title="..."
 *   message="..."           // string or node
 *   confirmLabel="Delete"
 *   cancelLabel="Cancel"
 *   onConfirm={fn}
 *   onCancel={fn}
 * />
 */
const ConfirmDialog = ({
  open,
  tone = 'danger',
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  busy = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return undefined;

    const handleKey = (e) => {
      if (e.key === 'Escape' && !busy) onCancel?.();
      if (e.key === 'Enter' && !busy) onConfirm?.();
    };
    document.addEventListener('keydown', handleKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, busy, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div
      className="confirm-overlay"
      role="presentation"
      onClick={() => { if (!busy) onCancel?.(); }}
    >
      <div
        className={`confirm-card tone-${tone}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="confirm-close"
          onClick={() => { if (!busy) onCancel?.(); }}
          aria-label="Close dialog"
        >
          <X size={16} />
        </button>

        <div className="confirm-icon">
          <AlertTriangle size={26} />
        </div>

        <h3 id="confirm-title" className="confirm-title">{title}</h3>

        {message && <div className="confirm-message">{message}</div>}

        <div className="confirm-actions">
          <button type="button" className="confirm-btn cancel" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button type="button" className={`confirm-btn confirm ${tone}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
