import axiosClient from '../api/axiosClient.js';

/**
 * Admin <-> Volunteer conversation threads.
 * Used by the admin panel to request more details / reply directly, and by the
 * volunteer desk to read and answer those messages.
 */
const replyService = {
  /** Admin: all conversation threads (optionally filtered by volunteer) */
  async getAdminReplies(volunteerId) {
    const response = await axiosClient.get('/api/admin/replies', {
      params: volunteerId ? { volunteerId } : {},
    });
    return response.data;
  },

  /**
   * Admin: send a reply to a volunteer.
   * @param {Object} payload - { eventId?, volunteerId?, kind, subject, body }
   */
  async sendAdminReply(payload) {
    const response = await axiosClient.post('/api/admin/replies', payload);
    return response.data;
  },

  /** Admin: close a conversation */
  async closeReplyThread(threadId) {
    const response = await axiosClient.patch(`/api/admin/replies/${threadId}/close`);
    return response.data;
  },

  /** Admin: approved volunteers available for direct messaging */
  async getMessageableVolunteers() {
    const response = await axiosClient.get('/api/admin/messageable-volunteers');
    return response.data;
  },

  /** Admin: start a direct (non-event) conversation with a volunteer */
  async sendDirectMessage(payload) {
    const response = await axiosClient.post('/api/admin/messages', payload);
    return response.data;
  },

  /** Admin: full record of what came in, admin decisions and saved responses */
  async getAuditTrail(limit = 60) {
    const response = await axiosClient.get('/api/admin/audit-trail', { params: { limit } });
    return response.data;
  },

  /** Volunteer: threads addressed to me */
  async getMyReplies() {
    const response = await axiosClient.get('/api/replies/my');
    return response.data;
  },

  /** Volunteer: reply back into a thread */
  async replyToThread(threadId, body) {
    const response = await axiosClient.post(`/api/replies/${threadId}/message`, { body });
    return response.data;
  },
};

export default replyService;
