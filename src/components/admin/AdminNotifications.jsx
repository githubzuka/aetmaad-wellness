import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, RefreshCw, X, MessageSquare, Store, User, Calendar, FileText } from 'lucide-react';
import notificationService from '../../services/notificationService';
import './AdminNotifications.css';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await notificationService.getAdminNotifications();
      if (res && res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch admin notifications', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(false);

    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 12000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.read && !n.isRead) {
      handleMarkAsRead(n._id);
    }
    if (n.metadata || n.type === 'shop_feedback') {
      setSelectedFeedback(n);
    }
  };

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
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-emerald-600" />
              <h3 className="text-sm font-bold text-neutral-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] bg-emerald-100 text-emerald-800 rounded-full font-bold">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fetchNotifications(false)}
                className="admin-icon-btn"
                title="Refresh Notifications"
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

          {/* List of Notifications */}
          <div className="admin-notif-list">
            {loading ? (
              <div className="py-10 text-center text-xs text-neutral-400 font-medium">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-neutral-400 font-medium">No notifications available</div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.read && !n.isRead;
                const formattedTime = new Date(n.createdAt).toLocaleString();

                return (
                  <div
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`admin-notif-item ${isUnread ? 'unread' : ''}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(n)}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <MessageSquare size={16} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                          {n.title}
                        </h4>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1">
                        <span className="text-[10px] text-neutral-400 font-medium">{formattedTime}</span>
                        
                        {isUnread && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(n._id, e)}
                            className="admin-link-btn"
                          >
                            <Check size={12} />
                            <span>Mark Read</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* Detail Modal for Feedback Notification Reports */}
      {selectedFeedback && (
        <div className="admin-notif-overlay">
          <div className="admin-notif-modal">
            
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 leading-tight">Weekly Shop Feedback</h3>
                  <p className="text-xs text-neutral-500 font-medium">{selectedFeedback.title}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="admin-icon-btn"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal details body */}
            <div className="space-y-3.5 text-xs text-neutral-800">
              
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                    <Store size={14} className="text-neutral-400" /> Shop Name:
                  </span>
                  <strong className="text-neutral-900 font-bold">{selectedFeedback.metadata?.shopName || 'Registered Shop'}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                    <User size={14} className="text-neutral-400" /> Submitted By:
                  </span>
                  <strong className="text-neutral-900 font-bold">{selectedFeedback.metadata?.volunteerName || 'Volunteer'}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium">Operating Status:</span>
                  <span className="px-2.5 py-0.5 text-[11px] bg-emerald-100 text-emerald-800 rounded-full font-bold">
                    {selectedFeedback.metadata?.status || 'Active'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                    <Calendar size={14} className="text-neutral-400" /> Date & Time:
                  </span>
                  <span className="text-neutral-700 font-semibold">
                    {new Date(selectedFeedback.metadata?.submittedAt || selectedFeedback.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedFeedback.metadata?.suppliesNote && (
                <div>
                  <h4 className="font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                    Feed & Supplies Notes:
                  </h4>
                  <p className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 font-medium text-neutral-800 leading-relaxed">
                    {selectedFeedback.metadata.suppliesNote}
                  </p>
                </div>
              )}

              {selectedFeedback.metadata?.notes && (
                <div>
                  <h4 className="font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                    General Observations & Issues:
                  </h4>
                  <p className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 font-medium text-neutral-800 leading-relaxed">
                    {selectedFeedback.metadata.notes}
                  </p>
                </div>
              )}

            </div>

            <div className="mt-5 pt-4 border-t border-neutral-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="admin-modal-close-btn"
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminNotifications;