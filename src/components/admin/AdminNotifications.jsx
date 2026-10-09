import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bell, Check, RefreshCw, X, MessageSquare, Store, Calendar,
  CalendarDays, ShoppingBag, UserPlus, AlertTriangle, Info, Send, Reply,
  ShieldAlert, History, PenSquare, CheckCircle2, Users, Lock, Inbox, BellDot
} from 'lucide-react';
import notificationService from '../../services/notificationService';
import replyService from '../../services/replyService';
import adminService from '../../services/adminService';
import './AdminNotifications.css';

/**
 * Map each real notification type to its own icon, accent and label so the
 * panel reflects the actual notification instead of one generic placeholder.
 */
const NOTIFICATION_META = {
  shop_feedback: { icon: Store, label: 'Shop Feedback' },
  event_proposal: { icon: CalendarDays, label: 'Event Proposal' },
  event_upcoming: { icon: CalendarDays, label: 'Upcoming Event' },
  volunteer_application: { icon: UserPlus, label: 'Volunteer Application' },
  order_status: { icon: ShoppingBag, label: 'Order Update' },
  system: { icon: AlertTriangle, label: 'System' },
  security: { icon: ShieldAlert, label: 'Security Alert' },
  general: { icon: Info, label: 'General' },
};

const getNotificationMeta = (type) => NOTIFICATION_META[type] || { icon: MessageSquare, label: 'Notification' };

/** Ready-made admin reply templates. */
const REPLY_TEMPLATES = [
  { value: 'more_details', label: 'Request more details', body: 'Please share more details: expected number of participants, exact venue, required supplies, and the volunteer support you will need.' },
  { value: 'approved_note', label: 'Approve with a note', body: 'This has been reviewed and approved. Please confirm you can proceed and share your final preparation plan.' },
  { value: 'rejected_note', label: 'Request a change', body: 'Thank you for the submission. We would like some changes before approval — please review the details and resubmit.' },
  { value: 'general', label: 'Direct reply', body: '' },
];

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

/** Sections available in the panel. */
const SECTIONS = [
  { key: 'inbox', label: 'Inbox', icon: Inbox },
  { key: 'audit', label: 'Audit Trail', icon: History },
  { key: 'security', label: 'Security', icon: ShieldAlert },
];

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Active section: inbox | audit | security
  const [activeSection, setActiveSection] = useState('inbox');

  // Inbox sub-filter: requests | everything
  const [inboxTab, setInboxTab] = useState('requests');

  // Seen notifications (moved out of the notification list into the inbox)
  const [seenItems, setSeenItems] = useState([]);
  const [showSeen, setShowSeen] = useState(false);

  // Detail alert box — always holds exactly ONE notification
  const [detailNotification, setDetailNotification] = useState(null);

  // Reply composer
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyKind, setReplyKind] = useState('more_details');
  const [replyBody, setReplyBody] = useState(REPLY_TEMPLATES[0].body);
  const [replySending, setReplySending] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState(null);

  // Direct message composer (admin initiates contact with a volunteer)
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [volunteerList, setVolunteerList] = useState([]);
  const [volunteerSearch, setVolunteerSearch] = useState('');
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [composeSubject, setComposeSubject] = useState('Message from ASHVA Admin');
  const [composeBody, setComposeBody] = useState('');
  const [composeSending, setComposeSending] = useState(false);
  const [composeFeedback, setComposeFeedback] = useState(null);

  // Audit trail
  const [auditEvents, setAuditEvents] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilter, setAuditFilter] = useState('all');

  const fetchNotifications = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [pendingRes, inboxRes] = await Promise.allSettled([
        notificationService.getAdminNotifications(),
        notificationService.getAdminInbox(),
      ]);

      if (pendingRes.status === 'fulfilled' && pendingRes.value?.success) {
        // Only UNSEEN items belong in the notification list. Once the admin has
        // seen one it moves to the inbox below.
        const unseen = (pendingRes.value.data || []).filter((n) => !n.read && !n.isRead);
        setNotifications(unseen);
        setUnreadCount(pendingRes.value.unreadCount || unseen.length);
      }

      if (inboxRes.status === 'fulfilled' && inboxRes.value?.success) {
        setSeenItems(inboxRes.value.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin notifications', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  const fetchAuditTrail = useCallback(async (silent = false) => {
    if (!silent) setAuditLoading(true);
    try {
      const res = await replyService.getAuditTrail(80);
      if (res?.success) setAuditEvents(res.data || []);
    } catch (err) {
      console.error('Failed to load audit trail', err);
    } finally {
      if (!silent) setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(false);
    const interval = setInterval(() => fetchNotifications(true), 12000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Load audit trail lazily the first time that section is opened
  useEffect(() => {
    if (activeSection === 'audit' && auditEvents.length === 0) fetchAuditTrail(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  // ---- Derived collections ---------------------------------------------
  const securitySection = useMemo(
    () => notifications
      .filter((n) => n.type === 'security')
      .sort((a, b) => {
        const s = (SEVERITY_ORDER[a.metadata?.severity] ?? 9) - (SEVERITY_ORDER[b.metadata?.severity] ?? 9);
        return s !== 0 ? s : new Date(b.createdAt) - new Date(a.createdAt);
      }),
    [notifications]
  );
  const securityUnread = securitySection.filter((n) => !n.read && !n.isRead).length;
  const securityCritical = securitySection.filter((n) => n.metadata?.severity === 'critical').length;

  const REQUEST_TYPES = ['event_proposal', 'volunteer_application', 'shop_feedback'];
  const requestSection = notifications.filter((n) => REQUEST_TYPES.includes(n.type));
  const requestUnread = requestSection.filter((n) => !n.read && !n.isRead).length;

  // "Other" intentionally excludes security now that it has its own section
  const otherSection = notifications.filter(
    (n) => !REQUEST_TYPES.includes(n.type) && n.type !== 'security'
  );
  const otherUnread = otherSection.filter((n) => !n.read && !n.isRead).length;

  const visibleNotifications = inboxTab === 'requests'
    ? requestSection
    : [...otherSection].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationService.markAsRead(id);
      // Move it out of the notification list and into the inbox immediately,
      // so a seen item never lingers in Notifications.
      setNotifications((prev) => {
        const moving = prev.find((n) => n._id === id);
        if (moving) {
          const moved = { ...moving, read: true, isRead: true };
          setSeenItems((seen) =>
            seen.some((s) => s._id === id) ? seen : [moved, ...seen]
          );
        }
        return prev.filter((n) => n._id !== id);
      });
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setDetailNotification((cur) => (cur && cur._id === id ? { ...cur, read: true, isRead: true } : cur));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  }, []);

  /**
   * Opening a notification shows ONLY that notification in the alert box, and
   * marks it read because the admin has now genuinely seen it.
   */
  const openDetail = (n) => {
    setDetailNotification(n);
    if (!n.read && !n.isRead) markAsRead(n._id);
  };

  const handleMarkAsRead = (id, e) => {
    if (e) e.stopPropagation();
    markAsRead(id);
  };

  // ---- Reply composer ----------------------------------------------------
  const openReplyComposer = (n, e) => {
    if (e) e.stopPropagation();
    setReplyTarget(n);
    setReplyKind('more_details');
    setReplyBody(REPLY_TEMPLATES[0].body);
    setReplyFeedback(null);
    setIsComposeOpen(false);
  };

  const handleKindChange = (value) => {
    setReplyKind(value);
    const template = REPLY_TEMPLATES.find((t) => t.value === value);
    if (template && template.body) setReplyBody(template.body);
  };

  const sendReply = async () => {
    if (!replyTarget || !replyBody.trim()) return;
    setReplySending(true);
    setReplyFeedback(null);
    try {
      await replyService.sendAdminReply({
        eventId: replyTarget.metadata?.eventId || undefined,
        volunteerId: replyTarget.metadata?.volunteerId || undefined,
        kind: replyKind,
        subject: replyTarget.title || '',
        body: replyBody.trim(),
      });
      setReplyFeedback({ type: 'success', text: 'Reply sent — the volunteer sees it in their volunteer desk.' });
      if (!replyTarget.read && !replyTarget.isRead) markAsRead(replyTarget._id);
      fetchAuditTrail(true);
      setTimeout(() => {
        setReplyTarget(null);
        setReplyFeedback(null);
      }, 1400);
    } catch (err) {
      setReplyFeedback({ type: 'error', text: err.message || 'Could not send the reply.' });
    } finally {
      setReplySending(false);
    }
  };

  // ---- Direct message composer ------------------------------------------
  const openCompose = async () => {
    setReplyTarget(null);
    setIsComposeOpen(true);
    setComposeFeedback(null);
    setSelectedVolunteerId('');
    setComposeSubject('Message from ASHVA Admin');
    setComposeBody('');
    setVolunteerSearch('');

    if (volunteerList.length === 0) {
      try {
        // Approved volunteers only — reuses the admin volunteers endpoint
        const res = await adminService.getVolunteers({ status: 'approved' });
        setVolunteerList(res?.data || []);
      } catch (err) {
        console.error('Failed to load volunteers', err);
        setComposeFeedback({ type: 'error', text: 'Could not load the volunteer list.' });
      }
    }
  };

  const sendCompose = async () => {
    if (!selectedVolunteerId || !composeBody.trim()) return;
    setComposeSending(true);
    setComposeFeedback(null);
    try {
      const res = await replyService.sendDirectMessage({
        volunteerId: selectedVolunteerId,
        subject: composeSubject.trim() || 'Message from ASHVA Admin',
        body: composeBody.trim(),
      });
      setComposeFeedback({ type: 'success', text: res?.message || 'Message sent to the volunteer.' });
      fetchAuditTrail(true);
      setTimeout(() => {
        setIsComposeOpen(false);
        setComposeFeedback(null);
      }, 1500);
    } catch (err) {
      setComposeFeedback({ type: 'error', text: err.message || 'Could not send the message.' });
    } finally {
      setComposeSending(false);
    }
  };

  const canReply = (n) => Boolean(n.metadata?.eventId || n.metadata?.volunteerId);

  const filteredVolunteers = volunteerList.filter((v) => {
    if (!volunteerSearch.trim()) return true;
    const q = volunteerSearch.toLowerCase();
    return (
      v.name?.toLowerCase().includes(q) ||
      v.email?.toLowerCase().includes(q) ||
      v.city?.toLowerCase().includes(q)
    );
  });

  const selectedVolunteer = volunteerList.find((v) => v._id === selectedVolunteerId);

  // ---- Audit trail filtering -------------------------------------------
  const AUDIT_FILTERS = [
    { value: 'all', label: 'All Activity' },
    { value: 'incoming', label: 'Incoming' },
    { value: 'admin', label: 'Admin Actions' },
    { value: 'response', label: 'Volunteer Responses' },
  ];

  const filteredAudit = auditEvents.filter((e) => {
    if (auditFilter === 'all') return true;
    if (auditFilter === 'incoming') return e.source === 'notification' || e.type === 'volunteer_application';
    if (auditFilter === 'admin') return ['admin_message', 'decision'].includes(e.source);
    if (auditFilter === 'response') return e.source === 'volunteer_response';
    return true;
  });

  const renderSeverityBadge = (severity) => (
    <span className={`admin-sev-badge ${severity}`}>{String(severity).toUpperCase()}</span>
  );

  return (
    <div className="admin-notif-wrapper">

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="admin-notif-trigger"
        title="Admin Notifications & Feedback Reports"
        aria-expanded={isOpen}
      >
        <Bell size={18} className="text-neutral-700 shrink-0" />
        <span className="hidden sm:inline">Notifications</span>

        {unreadCount > 0 && (
          <span className="admin-notif-badge">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Backdrop overlay for mobile drawer dismiss */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Notifications Dropdown Panel / Mobile Drawer */}
      {isOpen && (
        <div className="admin-notif-dropdown">

          {/* Header */}
          <div className="admin-notif-header">
            <div className="admin-notif-header-title">
              <Bell size={16} />
              <h3>Admin Notification Centre</h3>
              {unreadCount > 0 && (
                <span className="admin-notif-unread-pill">{unreadCount} Unread</span>
              )}
            </div>

            <div className="admin-notif-header-actions">
              <button
                type="button"
                onClick={openCompose}
                className="admin-icon-btn"
                title="Message a volunteer directly"
              >
                <PenSquare size={15} />
              </button>
              <button
                type="button"
                onClick={() => (activeSection === 'audit' ? fetchAuditTrail(false) : fetchNotifications(false))}
                className="admin-icon-btn"
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="admin-icon-btn"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Section switcher: Inbox | Audit Trail | Security */}
          <div className="admin-notif-sections" role="tablist" aria-label="Notification sections">
            {SECTIONS.map((section) => {
              const SectionIcon = section.icon;
              const counts = {
                inbox: unreadCount,
                audit: 0,
                security: securityUnread,
              };
              const totals = {
                inbox: requestSection.length + otherSection.length,
                audit: auditEvents.length,
                security: securitySection.length,
              };

              return (
                <button
                  key={section.key}
                  type="button"
                  role="tab"
                  aria-selected={activeSection === section.key}
                  className={`admin-notif-section-btn ${activeSection === section.key ? 'active' : ''} ${section.key === 'security' ? 'security' : ''}`}
                  onClick={() => setActiveSection(section.key)}
                >
                  <SectionIcon size={13} />
                  <span>{section.label}</span>
                  {totals[section.key] > 0 && (
                    <span className={`admin-notif-section-count ${counts[section.key] > 0 ? 'has-unread' : ''}`}>
                      {totals[section.key]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {activeSection === 'inbox' && (
            <>
              {/* Inbox sub-filter */}
              <div className="admin-notif-subfilter">
                <button
                  type="button"
                  className={`admin-notif-subfilter-btn ${inboxTab === 'requests' ? 'active' : ''}`}
                  onClick={() => setInboxTab('requests')}
                >
                  Volunteer Requests
                  {requestSection.length > 0 && (
                    <span className={`admin-notif-section-count ${requestUnread > 0 ? 'has-unread' : ''}`}>
                      {requestSection.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className={`admin-notif-subfilter-btn ${inboxTab === 'other' ? 'active' : ''}`}
                  onClick={() => setInboxTab('other')}
                >
                  Other Updates
                  {otherSection.length > 0 && (
                    <span className={`admin-notif-section-count ${otherUnread > 0 ? 'has-unread' : ''}`}>
                      {otherSection.length}
                    </span>
                  )}
                </button>
              </div>

              {/* List of Notifications */}
              <div className="admin-notif-list">
                {loading ? (
                  <div className="admin-notif-blank">Loading notifications…</div>
                ) : visibleNotifications.length === 0 ? (
                  <div className="admin-notif-blank">
                    {inboxTab === 'requests'
                      ? 'No volunteer requests or proposals right now.'
                      : 'No other updates available.'}
                  </div>
                ) : (
                  visibleNotifications.map((n) => {
                    const meta = getNotificationMeta(n.type);
                    const TypeIcon = meta.icon;
                    const replyable = canReply(n);

                    return (
                      <div
                        key={n._id}
                        onClick={() => openDetail(n)}
                        className="admin-notif-item unread"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && openDetail(n)}
                      >
                        <div className="admin-notif-item-icon">
                          <TypeIcon size={16} />
                        </div>

                        <div className="admin-notif-item-body">
                          <div className="admin-notif-item-top">
                            <h4 className="admin-notif-item-title">
                              {n.title || meta.label}
                            </h4>
                            <span className="admin-notif-unread-dot" aria-label="Unseen"></span>
                          </div>

                          <p className="admin-notif-item-message">
                            {n.message}
                          </p>

                          <div className="admin-notif-item-footer">
                            <span className="admin-notif-type-tag">{meta.label}</span>
                            {/* Repeated identical requests collapse into one entry */}
                            {(n.repeatCount || 1) > 1 && (
                              <span
                                className="admin-notif-repeat-badge"
                                title={`This request came in ${n.repeatCount} times — shown once to avoid duplicates`}
                              >
                                ×{n.repeatCount} requests
                              </span>
                            )}
                            <span className="admin-notif-item-time">
                              {new Date(n.lastRepeatAt || n.createdAt).toLocaleString()}
                            </span>

                            {replyable && (
                              <button
                                type="button"
                                onClick={(e) => openReplyComposer(n, e)}
                                className="admin-reply-btn"
                              >
                                <Reply size={12} />
                                <span>Reply</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => handleMarkAsRead(n._id, e)}
                              className="admin-link-btn"
                            >
                              <Check size={12} />
                              <span>Mark Seen</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ---------- SEEN ITEMS (moved out of the notification list) ---------- */}
              {seenItems.length > 0 && (
                <div className="admin-seen-block">
                  <button
                    type="button"
                    className="admin-seen-toggle"
                    onClick={() => setShowSeen((v) => !v)}
                    aria-expanded={showSeen}
                  >
                    <CheckCircle2 size={14} />
                    <span>Seen ({seenItems.length})</span>
                    <span className="admin-seen-chevron">{showSeen ? 'Hide' : 'Show'}</span>
                  </button>

                  {showSeen && (
                    <div className="admin-seen-list">
                      {seenItems.map((n) => {
                        const meta = getNotificationMeta(n.type);
                        const TypeIcon = meta.icon;
                        return (
                          <button
                            type="button"
                            key={n._id}
                            onClick={() => setDetailNotification(n)}
                            className="admin-seen-row"
                          >
                            <div className="admin-seen-icon">
                              <TypeIcon size={14} />
                            </div>
                            <div className="admin-seen-body">
                              <div className="admin-seen-top">
                                <strong>{n.title || meta.label}</strong>
                                {(n.repeatCount || 1) > 1 && (
                                  <span className="admin-notif-repeat-badge">×{n.repeatCount}</span>
                                )}
                              </div>
                              <p>{n.message}</p>
                              <span className="admin-seen-time">
                                <Check size={10} /> Seen · {new Date(n.lastRepeatAt || n.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ---------- SECURITY SECTION (dedicated, right-aligned alerts) ---------- */}
          {activeSection === 'security' && (
            <div className="admin-security-section">
              {securitySection.length > 0 && (
                <div className="admin-security-banner">
                  <ShieldAlert size={16} />
                  <div>
                    <strong>{securitySection.length} security event{securitySection.length === 1 ? '' : 's'} logged</strong>
                    <span>
                      {securityCritical > 0
                        ? `${securityCritical} critical — review immediately.`
                        : 'No critical events. All activity is within normal limits.'}
                    </span>
                  </div>
                </div>
              )}

              {securitySection.length === 0 ? (
                <div className="admin-notif-blank">
                  No security events detected. Failed logins, blocked injection attempts and rate-limit trips appear here.
                </div>
              ) : (
                <div className="admin-security-list">
                  {securitySection.map((n) => {
                    const isUnread = !n.read && !n.isRead;
                    const severity = n.metadata?.severity || 'medium';

                    return (
                      <button
                        type="button"
                        key={n._id}
                        onClick={() => openDetail(n)}
                        className={`admin-security-row severity-${severity} ${isUnread ? 'unread' : ''}`}
                      >
                        <div className="admin-security-row-icon">
                          <ShieldAlert size={15} />
                        </div>
                        <div className="admin-security-row-body">
                          <div className="admin-security-row-top">
                            <strong>{n.title}</strong>
                            {renderSeverityBadge(severity)}
                          </div>
                          <p>{n.message}</p>
                          <span className="admin-security-row-time">
                            {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {isUnread && <span className="admin-notif-unread-dot" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ---------- AUDIT TRAIL SECTION ---------- */}
          {activeSection === 'audit' && (
            <div className="admin-audit-section">
              <div className="admin-audit-filters">
                {AUDIT_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    className={`admin-audit-filter-btn ${auditFilter === f.value ? 'active' : ''}`}
                    onClick={() => setAuditFilter(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {auditLoading ? (
                <div className="admin-notif-blank">Loading audit trail…</div>
              ) : filteredAudit.length === 0 ? (
                <div className="admin-notif-blank">
                  No recorded activity yet. Approvals, admin messages and volunteer responses are saved here.
                </div>
              ) : (
                <div className="admin-audit-list">
                  {filteredAudit.map((ev) => {
                    const isAdminAction = ['admin_message', 'decision'].includes(ev.source);
                    const isResponse = ev.source === 'volunteer_response';

                    return (
                      <div
                        key={ev.id}
                        className={`admin-audit-row ${isAdminAction ? 'admin-action' : ''} ${isResponse ? 'response' : ''}`}
                      >
                        <div className="admin-audit-marker">
                          {isAdminAction && <PenSquare size={13} />}
                          {isResponse && <Send size={13} />}
                          {!isAdminAction && !isResponse && <Bell size={13} />}
                        </div>

                        <div className="admin-audit-body">
                          <div className="admin-audit-top">
                            <strong>{ev.title}</strong>
                            <span className={`admin-audit-source ${isAdminAction ? 'admin' : isResponse ? 'response' : 'incoming'}`}>
                              {isAdminAction ? 'Admin' : isResponse ? 'Volunteer' : 'Incoming'}
                            </span>
                          </div>
                          <p>{ev.detail}</p>
                          <div className="admin-audit-meta">
                            {ev.meta?.volunteerName && <span><Users size={11} /> {ev.meta.volunteerName}</span>}
                            {ev.meta?.eventTitle && <span><CalendarDays size={11} /> {ev.meta.eventTitle}</span>}
                            <span><Calendar size={11} /> {new Date(ev.at).toLocaleString()}</span>
                            <span className={`admin-audit-seen ${ev.seen ? 'yes' : 'no'}`}>
                              {ev.seen ? <><CheckCircle2 size={11} /> Seen</> : <><Lock size={11} /> Unseen</>}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ============================================================
          DETAIL ALERT BOX — shows exactly ONE notification at a time
         ============================================================ */}
      {detailNotification && (
        <div className="admin-notif-overlay">
          <div className={`admin-notif-modal detail-${detailNotification.type}`}>
            <div className="admin-detail-header">
              <div className="admin-detail-heading">
                <div className={`admin-detail-icon type-${detailNotification.type}`}>
                  {(() => {
                    const DetailIcon = getNotificationMeta(detailNotification.type).icon;
                    return <DetailIcon size={20} />;
                  })()}
                </div>
                <div className="admin-detail-heading-copy">
                  <span className="admin-detail-eyebrow">
                    {getNotificationMeta(detailNotification.type).label}
                  </span>
                  {/* Title and message are presented separately */}
                  <h3>{detailNotification.title || 'Notification'}</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailNotification(null)}
                className="admin-icon-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-detail-body">
              {detailNotification.type === 'security' && (
                <div className={`admin-detail-sev severity-${detailNotification.metadata?.severity || 'medium'}`}>
                  {renderSeverityBadge(detailNotification.metadata?.severity || 'medium')}
                  <span>Detected {new Date(detailNotification.createdAt).toLocaleString()}</span>
                </div>
              )}

              {/* Message shown on its own, separate from the title */}
              <div className="admin-detail-message-block">
                <span className="admin-detail-field-label">Message</span>
                <p className="admin-detail-message">{detailNotification.message}</p>
              </div>

              <div className="admin-detail-meta-grid">
                <div className="admin-detail-meta-item">
                  <span className="admin-detail-field-label">Received</span>
                  <span className="admin-detail-field-value">
                    {new Date(detailNotification.createdAt).toLocaleString()}
                  </span>
                </div>

                {(detailNotification.repeatCount || 1) > 1 && (
                  <div className="admin-detail-meta-item">
                    <span className="admin-detail-field-label">Repeated requests</span>
                    <span className="admin-detail-field-value">
                      {detailNotification.repeatCount}× — collapsed into this one entry
                      {detailNotification.lastRepeatAt && (
                        <> (last {new Date(detailNotification.lastRepeatAt).toLocaleString()})</>
                      )}
                    </span>
                  </div>
                )}
                <div className="admin-detail-meta-item">
                  <span className="admin-detail-field-label">Status</span>
                  <span className="admin-detail-field-value">
                    {detailNotification.read || detailNotification.isRead ? (
                      <span className="admin-detail-seen yes"><CheckCircle2 size={12} /> Seen</span>
                    ) : (
                      <span className="admin-detail-seen no"><Lock size={12} /> Unseen</span>
                    )}
                  </span>
                </div>
                {detailNotification.type === 'shop_feedback' && (
                  <>
                    <div className="admin-detail-meta-item">
                      <span className="admin-detail-field-label">Shop</span>
                      <span className="admin-detail-field-value">
                        {detailNotification.metadata?.shopName || 'Registered Shop'}
                      </span>
                    </div>
                    <div className="admin-detail-meta-item">
                      <span className="admin-detail-field-label">Submitted by</span>
                      <span className="admin-detail-field-value">
                        {detailNotification.metadata?.volunteerName || 'Volunteer'}
                      </span>
                    </div>
                    <div className="admin-detail-meta-item">
                      <span className="admin-detail-field-label">Operating status</span>
                      <span className="admin-detail-field-value">
                        {detailNotification.metadata?.status || 'Active'}
                      </span>
                    </div>
                  </>
                )}

                {detailNotification.metadata?.identifier && (
                  <div className="admin-detail-meta-item">
                    <span className="admin-detail-field-label">Source</span>
                    <span className="admin-detail-field-value mono">
                      {detailNotification.metadata.identifier}
                    </span>
                  </div>
                )}

                {detailNotification.metadata?.attempts !== undefined && (
                  <div className="admin-detail-meta-item">
                    <span className="admin-detail-field-label">Attempts</span>
                    <span className="admin-detail-field-value">{detailNotification.metadata.attempts}</span>
                  </div>
                )}

                {detailNotification.metadata?.email && (
                  <div className="admin-detail-meta-item">
                    <span className="admin-detail-field-label">Account</span>
                    <span className="admin-detail-field-value">{detailNotification.metadata.email}</span>
                  </div>
                )}
              </div>

              {detailNotification.metadata?.suppliesNote && (
                <div className="admin-detail-note-block">
                  <span className="admin-detail-field-label">Feed &amp; Supplies Notes</span>
                  <p>{detailNotification.metadata.suppliesNote}</p>
                </div>
              )}

              {detailNotification.metadata?.notes && (
                <div className="admin-detail-note-block">
                  <span className="admin-detail-field-label">General Observations</span>
                  <p>{detailNotification.metadata.notes}</p>
                </div>
              )}
            </div>

            <div className="admin-detail-actions">
              <button
                type="button"
                className="admin-detail-close"
                onClick={() => setDetailNotification(null)}
              >
                Close
              </button>
              {canReply(detailNotification) && (
                <button
                  type="button"
                  className="admin-detail-reply"
                  onClick={() => { openReplyComposer(detailNotification); setDetailNotification(null); }}
                >
                  <Reply size={14} /> Reply to Volunteer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          DIRECT MESSAGE COMPOSER — admin contacts any volunteer
         ============================================================ */}
      {isComposeOpen && (
        <div className="admin-notif-overlay">
          <div className="admin-notif-modal admin-compose-modal">
            <div className="admin-reply-header">
              <div className="admin-reply-header-left">
                <div className="admin-reply-header-icon">
                  <PenSquare size={20} />
                </div>
                <div>
                  <h3>Message a Volunteer</h3>
                  <p>Send a direct message to any approved volunteer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="admin-icon-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {composeFeedback && (
              <div className={`admin-reply-feedback ${composeFeedback.type}`} role="status">
                {composeFeedback.type === 'success' ? <Check size={15} /> : <AlertTriangle size={15} />}
                <span>{composeFeedback.text}</span>
              </div>
            )}

            <div className="admin-reply-field">
              <label htmlFor="compose-volunteer">Recipient (approved volunteers only)</label>
              <input
                type="text"
                className="admin-compose-search"
                placeholder="Search by name, email or city…"
                value={volunteerSearch}
                onChange={(e) => setVolunteerSearch(e.target.value)}
              />
              <select
                id="compose-volunteer"
                value={selectedVolunteerId}
                onChange={(e) => setSelectedVolunteerId(e.target.value)}
              >
                <option value="">
                  {volunteerList.length === 0
                    ? 'Loading volunteers…'
                    : `-- Select a volunteer (${filteredVolunteers.length} available) --`}
                </option>
                {filteredVolunteers.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name} — {v.email}{v.city ? ` (${v.city})` : ''}
                  </option>
                ))}
              </select>
              {selectedVolunteer && (
                <span className="admin-compose-recipient">
                  <Check size={12} /> Sending to {selectedVolunteer.name}
                  {selectedVolunteer.city ? ` • ${selectedVolunteer.city}` : ''}
                </span>
              )}
            </div>

            <div className="admin-reply-field">
              <label htmlFor="compose-subject">Subject</label>
              <input
                id="compose-subject"
                type="text"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="e.g. Weekly shop update reminder"
              />
            </div>

            <div className="admin-reply-field">
              <label htmlFor="compose-body">Message</label>
              <textarea
                id="compose-body"
                rows={5}
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Type your message to the volunteer…"
              />
            </div>

            <div className="admin-reply-actions">
              <button
                type="button"
                className="admin-reply-cancel"
                onClick={() => setIsComposeOpen(false)}
                disabled={composeSending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-reply-send"
                onClick={sendCompose}
                disabled={composeSending || !selectedVolunteerId || !composeBody.trim()}
              >
                <Send size={14} />
                <span>{composeSending ? 'Sending…' : 'Send Message'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Composer — admin requests more details / replies directly */}
      {replyTarget && (
        <div className="admin-notif-overlay">
          <div className="admin-notif-modal admin-reply-modal">
            <div className="admin-reply-header">
              <div className="admin-reply-header-left">
                <div className="admin-reply-header-icon">
                  <Reply size={20} />
                </div>
                <div>
                  <h3>Reply to Volunteer</h3>
                  <p>{replyTarget.title || 'Event Proposal'}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                className="admin-icon-btn"
                aria-label="Close reply composer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-reply-context">
              <span className="admin-reply-context-label">Original request</span>
              <p>{replyTarget.message}</p>
            </div>

            {replyFeedback && (
              <div className={`admin-reply-feedback ${replyFeedback.type}`} role="status">
                {replyFeedback.type === 'success' ? <Check size={15} /> : <AlertTriangle size={15} />}
                <span>{replyFeedback.text}</span>
              </div>
            )}

            <div className="admin-reply-field">
              <label htmlFor="admin-reply-kind">Reply type</label>
              <select
                id="admin-reply-kind"
                value={replyKind}
                onChange={(e) => handleKindChange(e.target.value)}
              >
                {REPLY_TEMPLATES.map((template) => (
                  <option key={template.value} value={template.value}>{template.label}</option>
                ))}
              </select>
            </div>

            <div className="admin-reply-field">
              <label htmlFor="admin-reply-body">Message to volunteer</label>
              <textarea
                id="admin-reply-body"
                rows={5}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Type your message to the volunteer…"
              />
            </div>

            <div className="admin-reply-actions">
              <button
                type="button"
                className="admin-reply-cancel"
                onClick={() => setReplyTarget(null)}
                disabled={replySending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-reply-send"
                onClick={sendReply}
                disabled={replySending || !replyBody.trim()}
              >
                <Send size={14} />
                <span>{replySending ? 'Sending…' : 'Send Reply to Volunteer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminNotifications;