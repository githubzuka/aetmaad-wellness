import axiosClient from '../api/axiosClient.js';

/**
 * Upcoming events change rarely, so we keep a small in-memory cache.
 * On the first page load the request runs; on a reload / remount the cached
 * list renders instantly and a background refresh keeps it fresh. This removes
 * the "events appear late" flash after reloading.
 */
const CACHE_TTL_MS = 60 * 1000; // 1 minute
let upcomingCache = { data: null, timestamp: 0 };
let inFlightRequest = null;

const eventService = {
  /**
   * Fetch upcoming events. Pass { force: true } to bypass the cache.
   */
  async getUpcomingEvents({ force = false } = {}) {
    const isFresh =
      !force &&
      upcomingCache.data &&
      Date.now() - upcomingCache.timestamp < CACHE_TTL_MS;

    if (isFresh) {
      return { success: true, data: upcomingCache.data, cached: true };
    }

    // De-duplicate concurrent calls (e.g. React StrictMode double-mount)
    if (inFlightRequest) {
      return inFlightRequest;
    }

    inFlightRequest = axiosClient
      .get('/api/events')
      .then((response) => {
        const data = response.data;
        upcomingCache = {
          data: data?.data || [],
          timestamp: Date.now(),
        };
        return data;
      })
      .finally(() => {
        inFlightRequest = null;
      });

    return inFlightRequest;
  },

  /** Synchronous peek at the cache so a component can paint instantly. */
  getCachedUpcomingEvents() {
    return upcomingCache.data;
  },

  /** Clear the cache (call after admin creates/updates an event). */
  clearUpcomingCache() {
    upcomingCache = { data: null, timestamp: 0 };
  },

  async proposeEvent(eventData) {
    const response = await axiosClient.post('/api/events/propose', eventData);
    return response.data;
  },

  async respondToEvent(eventId, responseValue) {
    const response = await axiosClient.patch(`/api/events/${eventId}/response`, { response: responseValue });
    return response.data;
  },
};

export default eventService;
