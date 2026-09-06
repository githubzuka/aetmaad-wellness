import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, RefreshCw, X, MessageSquare, Store, User, Calendar, FileText } from 'lucide-react';
import notificationService from '../../services/notificationService';

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
    <div className="relative">
      
      {/* Bell Button Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-white border border-neutral-200/80 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-all shadow-sm cursor-pointer flex items-center gap-2 active:scale-95"
        title="Admin Notifications & Feedback Reports"
      >
        <Bell size={18} className="text-neutral-700" />
        <span className="text-xs font-semibold text-neutral-800 hidden sm:inline">Notifications</span>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-xs border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between font-bold text-neutral-900">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-emerald-600" />
              <h3 className="text-sm font-bold text-neutral-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded-full font-semibold">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchNotifications(false)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors"
                title="Refresh Notifications"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List of Notifications */}
          <div className="max-h-96 overflow-y-auto divide-y divide-neutral-100">
            {loading ? (
              <div className="py-8 text-center text-xs text-neutral-400 font-medium">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400 font-medium">No notifications available</div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.read && !n.isRead;
                const formattedTime = new Date(n.createdAt).toLocaleString();

                return (
                  <div
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 border-b border-neutral-100 last:border-0 transition-colors flex gap-3.5 items-start cursor-pointer ${
                      isUnread ? 'bg-emerald-50/30 hover:bg-neutral-50' : 'bg-white hover:bg-neutral-50/70'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare size={16} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-semibold text-neutral-900 truncate">
                          {n.title}
                        </h4>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-neutral-400">{formattedTime}</span>
                        
                        {isUnread && (
                          <button
                            onClick={(e) => handleMarkAsRead(n._id, e)}
                            className="text-xs text-emerald-700 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <Check size={12} />
                            <span>Mark as Read</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 leading-tight">Weekly Shop Feedback</h3>
                  <p className="text-xs text-neutral-500 font-medium">{selectedFeedback.title}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedFeedback(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Notification message details */}
            <div className="space-y-3.5 text-xs text-neutral-800">
              
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium flex items-center gap-1">
                    <Store size={14} className="text-neutral-400" /> Shop Name:
                  </span>
                  <strong className="text-neutral-900 font-bold">{selectedFeedback.metadata?.shopName || 'Registered Shop'}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium flex items-center gap-1">
                    <User size={14} className="text-neutral-400" /> Submitted By:
                  </span>
                  <strong className="text-neutral-900 font-bold">{selectedFeedback.metadata?.volunteerName || 'Volunteer'}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium">Operating Status:</span>
                  <span className="px-2 py-0.5 text-[11px] bg-emerald-100 text-emerald-800 rounded-full font-bold">
                    {selectedFeedback.metadata?.status || 'Active'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium flex items-center gap-1">
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
                  <p className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 font-medium text-neutral-800">
                    {selectedFeedback.metadata.suppliesNote}
                  </p>
                </div>
              )}

              {selectedFeedback.metadata?.notes && (
                <div>
                  <h4 className="font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                    General Observations & Issues:
                  </h4>
                  <p className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 font-medium text-neutral-800">
                    {selectedFeedback.metadata.notes}
                  </p>
                </div>
              )}

            </div>

            <div className="mt-5 pt-4 border-t border-neutral-100 flex justify-end">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
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
