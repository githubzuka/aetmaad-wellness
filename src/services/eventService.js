import axiosClient from '../api/axiosClient.js';

const eventService = {
  async getUpcomingEvents() {
    const response = await axiosClient.get('/api/events');
    return response.data;
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
