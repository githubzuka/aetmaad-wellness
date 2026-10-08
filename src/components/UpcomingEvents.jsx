import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock3, MapPin, Sparkles } from 'lucide-react';
import eventService from '../services/eventService';
import './UpcomingEvents.css';

const UpcomingEvents = () => {
  // Seed from the service cache so a reload paints events instantly
  // instead of showing the loading state again.
  const cachedEvents = eventService.getCachedUpcomingEvents();
  const [events, setEvents] = useState(cachedEvents || []);
  const [loading, setLoading] = useState(!cachedEvents);
  const [error, setError] = useState(null);

  const loadEvents = async (force = false) => {
    // Keep the cached list on screen while refreshing (no flash)
    if (!events.length) setLoading(true);
    setError(null);
    try {
      const res = await eventService.getUpcomingEvents({ force });
      setEvents(res?.data || []);
    } catch (requestError) {
      console.error('Failed to load upcoming events:', requestError);
      // Only surface the error if we have nothing to display
      setError(requestError.message || 'Unable to load events right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();

    // Background refresh every 60s keeps the public calendar current
    const interval = setInterval(() => loadEvents(true), 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isInitialLoading = loading && events.length === 0;

  return (
    <section className="upcoming-events-section" id="events">
      <div className="events-section-heading">
        <div>
          <span className="events-eyebrow"><Sparkles size={14} /> ASHVA COMMUNITY CALENDAR</span>
          <h2>Upcoming Events</h2>
          <p>Join ASHVA gatherings, welfare drives, and local working-horse initiatives.</p>
        </div>
        <CalendarDays className="events-heading-icon" size={46} aria-hidden="true" />
      </div>

      {isInitialLoading ? (
        <div className="events-empty-state">Loading upcoming events...</div>
      ) : error && events.length === 0 ? (
        <div className="events-empty-state">
          <p>{error}</p>
          <button type="button" className="events-retry-button" onClick={() => loadEvents(true)}>Try Again</button>
        </div>
      ) : events.length === 0 ? (
        <div className="events-empty-state">New ASHVA events will appear here soon.</div>
      ) : (
        <div className="events-grid">
          {events.map((event) => {
            const eventDate = new Date(event.date);
            return (
              <article className="event-card" key={event._id}>
                <div className="event-date-badge">
                  <span>{eventDate.toLocaleDateString('en-IN', { month: 'short' })}</span>
                  <strong>{eventDate.getDate()}</strong>
                </div>
                <div className="event-card-content">
                  <span className="event-city">{event.city}</span>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className="event-meta"><Clock3 size={15} /> {event.time}</div>
                  <div className="event-meta"><MapPin size={15} /> {event.location}</div>
                  <div className="event-organizer">
                    Hosted by {event.organizer}
                    {event.volunteerHostName && <><br />Volunteer host: {event.volunteerHostName}</>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default UpcomingEvents;
