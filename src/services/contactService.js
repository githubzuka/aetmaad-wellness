import axiosClient from '../api/axiosClient.js';

/**
 * Public contact / outreach enquiries and the admin inbox that reads them.
 */
const contactService = {
  /** Public: submit an enquiry from the Contact page */
  async submitContact(payload) {
    const response = await axiosClient.post('/api/contact', payload);
    return response.data;
  },

  /** Admin: all enquiries (optionally filtered by status) */
  async getAdminContacts(status) {
    const response = await axiosClient.get('/api/admin/contacts', {
      params: status && status !== 'all' ? { status } : {},
    });
    return response.data;
  },

  /** Admin: update the status / internal note on an enquiry */
  async updateContact(id, payload) {
    const response = await axiosClient.patch(`/api/admin/contacts/${id}`, payload);
    return response.data;
  },
};

export default contactService;
