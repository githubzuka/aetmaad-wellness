 import React, { useEffect, useState, useCallback } from 'react';
import {
  ShieldAlert, RefreshCw, Check, AlertTriangle, X,
  LogIn, Ban, Bug, Flame, ShieldQuestion, Loader2
} from 'lucide-react';
import notificationService from '../../services/notificationService';
import './AdminSecurity.css';

const KIND_META = {
  failed_login: { icon: LogIn, label: 'Failed Login' },
  auth_brute_force: { icon: Ban, label: 'Brute Force Blocked' },
  injection_attempt: { icon: Bug, label: 'Injection Attempt' },
  api_flood: { icon: Flame, label: 'API Flood' },
  public_write_abuse: { icon: Flame, label: 'Write Abuse' },
  contact_spam: { icon: Flame, label: 'Contact Spam' },
  password_reset_unknown: { icon: ShieldQuestion, label: 'Unknown Reset' },
  general: { icon: ShieldAlert, label: 'Security Event' },
};

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const AdminSecurity = ({ onAction }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const loadAlerts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await notificationService.getAdminNotifications();
      const all = res?.data || [];
      // The security feed is exactly the notifications of type 'security'
      setAlerts(all.filter((n) => n.type === 'security'));
    } catch (err) {
      console.error('Failed to load security alerts:', err);
      if (onAction) onAction({ type: 'error', text: err.message || 'Unable to load security alerts.' });
    } finally {
      if (!silent) setLoading(false);
    }
  }, [onAction]);

  useEffect(() => {
    loadAlerts(false);
    const interval = setInterval(() => loadAlerts(true), 20000);
    return () => clearInterval(interval);
  }, [loadAlerts]);

  const markRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, read: true, isRead: true } : a)));
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  const severityOf = (a) => a.metadata?.severity || 'medium';
  const kindOf = (a) => a.metadata?.kind || 'general';

  const unread = alerts.filter((a) => !a.read && !a.isRead).length;
  const critical = alerts.filter((a) => severityOf(a) === 'critical').length;

  const filtered = alerts
    .filter((a) => (filter === 'all' ? true : filter === 'unread' ? !a.read && !a.isRead : severityOf(a) === filter))
    .sort((a, b) => {
      const sev = (SEVERITY_ORDER[severityOf(a)] ?? 9) - (SEVERITY_ORDER[severityOf(b)] ?? 9);
      if (sev !== 0) return sev;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const FILTERS = [
    { value: 'all', label: `All (${alerts.length})` },
    { value: 'unread', label: `Unread (${unread})` },
    { value: 'critical', label: `Critical (${critical})` },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  return (
    <div className="admin-security-desk">
      <div className="desk-header admin-security-header">
        <div>
          <h2>Security Alerts ({alerts.length})</h2>
          <p>Real-time record of failed logins, blocked injection attempts, rate-limit trips and other suspicious activity.</p>
        </div>
        <button className="btn-security-refresh" onClick={() => loadAlerts(false)}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Severity summary */}
      <div className="security-summary-row">
        <div className="security-summary critical">
          <ShieldAlert size={18} />
          <div>
            <span>{alerts.filter((a) => severityOf(a) === 'critical').length}</span>
            <small>Critical</small>
          </div>
        </div>
        <div className="security-summary high">
          <AlertTriangle size={18} />
          <div>
            <span>{alerts.filter((a) => severityOf(a) === 'high').length}</span>
            <small>High</small>
          </div>
        </div>
        <div className="security-summary medium">
          <ShieldQuestion size={18} />
          <div>
            <span>{alerts.filter((a) => severityOf(a) === 'medium').length}</span>
            <small>Medium</small>
          </div>
        </div>
        <div className="security-summary low">
          <LogIn size={18} />
          <div>
            <span>{alerts.filter((a) => severityOf(a) === 'low').length}</span>
            <small>Low</small>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="security-filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`security-filter-btn ${filter === f.value ? 'active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="security-empty"><Loader2 size={20} className="spin" /> Loading security events…</div>
      ) : filtered.length === 0 ? (
        <div className="security-empty">
          <ShieldAlert size={40} />
          <h3>No security alerts</h3>
          <p>No suspicious activity has been detected for this filter.</p>
        </div>
      ) : (
        <div className="security-list">
          {filtered.map((a) => {
            const kind = kindOf(a);
            const meta = KIND_META[kind] || KIND_META.general;
            const KindIcon = meta.icon;
            const severity = severityOf(a);
            const isUnread = !a.read && !a.isRead;

            return (
              <div
                key={a._id}
                className={`security-row severity-${severity} ${isUnread ? 'unread' : ''}`}
                onClick={() => setSelected(a)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelected(a)}
              >
                <div className="security-row-icon">
                  <KindIcon size={17} />
                </div>

                <div className="security-row-body">
                  <div className="security-row-top">
                    <strong>{a.title}</strong>
                    <span className={`security-severity ${severity}`}>{severity.toUpperCase()}</span>
                    {isUnread && <span className="security-unread-dot" />}
                  </div>
                  <p>{a.message}</p>
                  <div className="security-row-meta">
                    <span className="security-kind">{meta.label}</span>
                    <span>{new Date(a.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {isUnread && (
                  <button
                    type="button"
                    className="security-mark-read"
                    onClick={(e) => markRead(a._id, e)}
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail */}
      {selected && (
        <div className="security-modal-overlay" role="presentation" onClick={() => setSelected(null)}>
          <div className="security-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="security-modal-header">
              <div className="security-modal-heading">
                <div className={`security-modal-icon ${severityOf(selected)}`}>
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3>{selected.title}</h3>
                  <p>{new Date(selected.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button type="button" className="security-icon-btn" onClick={() => setSelected(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="security-modal-body">
              <p className="security-modal-message">{selected.message}</p>

              <div className="security-modal-grid">
                <div className="security-modal-detail">
                  <span className="security-modal-label">Type</span>
                  <span className="security-modal-value">{(KIND_META[kindOf(selected)] || KIND_META.general).label}</span>
                </div>
                <div className="security-modal-detail">
                  <span className="security-modal-label">Severity</span>
                  <span className={`security-severity ${severityOf(selected)}`}>{severityOf(selected).toUpperCase()}</span>
                </div>
                {selected.metadata?.identifier && (
                  <div className="security-modal-detail">
                    <span className="security-modal-label">Source</span>
                    <span className="security-modal-value mono">{selected.metadata.identifier}</span>
                  </div>
                )}
                {selected.metadata?.path && (
                  <div className="security-modal-detail">
                    <span className="security-modal-label">Endpoint</span>
                    <span className="security-modal-value mono">{selected.metadata.method} {selected.metadata.path}</span>
                  </div>
                )}
                {typeof selected.metadata?.attempts === 'number' && (
                  <div className="security-modal-detail">
                    <span className="security-modal-label">Attempts</span>
                    <span className="security-modal-value">{selected.metadata.attempts}</span>
                  </div>
                )}
                {selected.metadata?.email && (
                  <div className="security-modal-detail">
                    <span className="security-modal-label">Account</span>
                    <span className="security-modal-value">{selected.metadata.email}</span>
                  </div>
                )}
              </div>

              {selected.metadata?.userAgent && (
                <div className="security-modal-ua">
                  <span className="security-modal-label">User agent</span>
                  <p>{selected.metadata.userAgent}</p>
                </div>
              )}

              {Array.isArray(selected.metadata?.suspiciousKeys) && selected.metadata.suspiciousKeys.length > 0 && (
                <div className="security-modal-blocked">
                  <span className="security-modal-label">Blocked payload keys</span>
                  <p className="mono">{selected.metadata.suspiciousKeys.join(', ')}</p>
                </div>
              )}
            </div>

            <div className="security-modal-actions">
              <button
                type="button"
                className="security-modal-btn"
                onClick={() => { markRead(selected._id); setSelected(null); }}
              >
                <Check size={14} /> Mark as Reviewed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSecurity;
