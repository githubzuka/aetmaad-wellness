import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import notificationService from '../../services/notificationService';
import eventService from '../../services/eventService';
import './VolunteerNotifications.css';

const VolunteerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getUserNotifications();
      setNotifications((response.data || []).filter((notification) => notification.type === 'event_upcoming'));
    } catch (error) {
      console.error('Failed to load volunteer notifications:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.read && !notification.isRead).length;

  const respondToEvent = async (eventId, response) => {
    try {
      await eventService.respondToEvent(eventId, response);
      setActionMessage(`Event marked as ${response}. Admin has been notified.`);
      setNotifications((current) => current.map((notification) => (
        notification.metadata?.eventId === eventId
          ? { ...notification, metadata: { ...notification.metadata, requiresResponse: false, response } }
          : notification
      )));
    } catch (error) {
      setActionMessage(error.message || 'Unable to record your response.');
    }
  };

  return (
    <div className="volunteer-notifications">
      <button className="volunteer-notification-button" onClick={() => setOpen((current) => !current)} title="Event notifications">
        <Bell size={18} />
        {unreadCount > 0 && <span>{unreadCount}</span>}
      </button>
      {open && (
        <div className="volunteer-notification-panel">
          <div className="volunteer-notification-heading">
            <strong>Upcoming Event Alerts</strong>
            <button onClick={() => setOpen(false)} title="Close notifications"><X size={16} /></button>
          </div>
          {notifications.length === 0 ? (
            <p className="volunteer-notification-empty">No upcoming event alerts yet.</p>
          ) : (
            <>
              {actionMessage && <p className="volunteer-notification-action-message">{actionMessage}</p>}
              {notifications.slice(0, 8).map((notification) => (
              <div className={`volunteer-notification-item ${notification.read || notification.isRead ? '' : 'unread'}`} key={notification._id}>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
                <small>{new Date(notification.createdAt).toLocaleString()}</small>
                {notification.metadata?.requiresResponse && notification.metadata?.eventId && (
                  <div className="volunteer-event-response-actions">
                    <button onClick={() => respondToEvent(notification.metadata.eventId, 'agreed')}>Agree</button>
                    <button onClick={() => respondToEvent(notification.metadata.eventId, 'disagreed')}>Disagree</button>
                  </div>
                )}
              </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VolunteerNotifications;
