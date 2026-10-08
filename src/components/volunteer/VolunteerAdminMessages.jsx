import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, RefreshCw, CalendarDays, CheckCircle2, AlertCircle } from 'lucide-react';
import replyService from '../../services/replyService';
import './VolunteerAdminMessages.css';

/**
 * Volunteer desk inbox: shows every message an admin sent about the
 * volunteer's event proposals (or directly), and lets the volunteer reply back.
 */
const VolunteerAdminMessages = ({ onAction }) => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activeThread, setActiveThread] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const loadThreads = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await replyService.getMyReplies();
      const data = res?.data || [];
      setThreads(data);
      // Keep the open thread in sync with fresh server data
      setActiveThread((current) => {
        if (!current) return current;
        return data.find((t) => t._id === current._id) || current;
      });
    } catch (err) {
      console.error('Failed to load admin messages:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadThreads();
    const interval = setInterval(() => loadThreads(true), 45000);
    return () => clearInterval(interval);
  }, [loadThreads]);

  const unreadThreads = threads.filter((t) => t.status === 'open').length;

  const openThread = (thread) => {
    setActiveThread(thread);
    setReplyBody('');
    setError(null);
  };

  const sendReply = async () => {
    if (!activeThread || !replyBody.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await replyService.replyToThread(activeThread._id, replyBody.trim());
      const updated = res?.data;
      if (updated) {
        setThreads((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
        setActiveThread(updated);
      }
      setReplyBody('');
      if (onAction) onAction({ type: 'success', text: 'Your reply was sent to the admin team.' });
    } catch (err) {
      setError(err.message || 'Could not send your reply.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="vol-admin-msg-wrapper">
      <button
        type="button"
        className="vol-admin-msg-trigger"
        onClick={() => { setIsOpen((v) => !v); if (!isOpen) loadThreads(); }}
        aria-expanded={isOpen}
        title="Messages from the ASHVA admin team"
      >
        <MessageSquare size={18} />
        <span>Admin Messages</span>
        {unreadThreads > 0 && <span className="vol-admin-msg-badge">{unreadThreads}</span>}
      </button>

      {isOpen && (
        <div className="vol-admin-msg-dropdown">
          <div className="vol-admin-msg-header">
            <div className="vol-admin-msg-header-left">
              <MessageSquare size={15} />
              <h3>Messages from Admin</h3>
            </div>
            <div className="vol-admin-msg-header-actions">
              <button type="button" className="vol-admin-icon-btn" onClick={() => loadThreads()} title="Refresh">
                <RefreshCw size={13} className={loading ? 'spin' : ''} />
              </button>
              <button type="button" className="vol-admin-icon-btn" onClick={() => setIsOpen(false)} title="Close">
                <X size={15} />
              </button>
            </div>
          </div>

          <div className="vol-admin-msg-list">
            {loading ? (
              <div className="vol-admin-msg-blank">Loading messages…</div>
            ) : threads.length === 0 ? (
              <div className="vol-admin-msg-blank">
                No admin messages yet. When you propose an event, admin replies will appear here.
              </div>
            ) : (
              threads.map((thread) => {
                const lastMessage = thread.messages?.[thread.messages.length - 1];
                return (
                  <button
                    type="button"
                    key={thread._id}
                    className="vol-admin-thread"
                    onClick={() => openThread(thread)}
                  >
                    <div className="vol-admin-thread-top">
                      <strong>{thread.subject || thread.event?.title || 'Admin message'}</strong>
                      <span className={`vol-admin-thread-status ${thread.status}`}>
                        {thread.status === 'open' ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    {thread.event?.title && (
                      <span className="vol-admin-thread-event">
                        <CalendarDays size={11} /> {thread.event.title}
                      </span>
                    )}
                    <p className="vol-admin-thread-preview">{lastMessage?.body}</p>
                    <span className="vol-admin-thread-time">
                      {new Date(thread.lastActivityAt || thread.updatedAt).toLocaleString()}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Thread detail modal */}
      {activeThread && (
        <div className="vol-admin-thread-overlay" role="presentation" onClick={() => setActiveThread(null)}>
          <div
            className="vol-admin-thread-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vol-admin-thread-modal-header">
              <div>
                <h3>{activeThread.subject || activeThread.event?.title || 'Conversation with Admin'}</h3>
                <p>{activeThread.event?.title ? `Event: ${activeThread.event.title}` : 'Direct message from ASHVA admin'}</p>
              </div>
              <button type="button" className="vol-admin-icon-btn" onClick={() => setActiveThread(null)} aria-label="Close">
                <X size={17} />
              </button>
            </div>

            <div className="vol-admin-chat">
              {(activeThread.messages || []).map((msg) => (
                <div key={msg._id || msg.createdAt} className={`vol-admin-chat-msg ${msg.senderRole}`}>
                  <div className="vol-admin-chat-bubble">
                    <span className="vol-admin-chat-sender">
                      {msg.senderRole === 'admin' ? 'ASHVA Admin' : 'You'}
                    </span>
                    <p>{msg.body}</p>
                    <span className="vol-admin-chat-time">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="vol-admin-chat-alert" role="alert">
                <AlertCircle size={14} /> <span>{error}</span>
              </div>
            )}

            {activeThread.status === 'closed' ? (
              <div className="vol-admin-chat-closed">
                <CheckCircle2 size={15} /> This conversation has been closed by the admin team.
              </div>
            ) : (
              <div className="vol-admin-chat-composer">
                <textarea
                  rows={3}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Type your reply to the admin team…"
                />
                <button
                  type="button"
                  className="vol-admin-chat-send"
                  onClick={sendReply}
                  disabled={sending || !replyBody.trim()}
                >
                  <Send size={14} />
                  <span>{sending ? 'Sending…' : 'Send Reply'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerAdminMessages;
