import axiosClient from '../api/axiosClient.js';

/**
 * Service for Admin Management & Platform Analytics API requests
 */
const adminService = {
  /**
   * Get list of volunteers (Supports status filter e.g. { status: 'pending' })
   * @param {Object} [params] - Query filter parameters
   */
  async getVolunteers(params = {}) {
    const response = await axiosClient.get('/api/admin/volunteers', { params });
    return response.data;
  },

  /**
   * Helper to get list of pending volunteer registrations
   */
  async getPendingVolunteers() {
    return this.getVolunteers({ status: 'pending' });
  },

  /**
   * Approve or reject a volunteer application
   * @param {string} volunteerId - User ObjectId for volunteer
   * @param {string} status - 'approved' | 'rejected' | 'pending'
   */
  async updateVolunteerStatus(volunteerId, status) {
    const response = await axiosClient.put(`/api/admin/volunteers/${volunteerId}/status`, { status });
    return response.data;
  },

  /**
   * Reassign a shop to a volunteer
   * @param {string} shopId - Shop ObjectId
   * @param {string|null} volunteerId - Target Volunteer ObjectId
   */
  async assignShopVolunteer(shopId, volunteerId) {
    const response = await axiosClient.put(`/api/admin/shops/${shopId}/assign`, { volunteerId });
    return response.data;
  },

  /**
   * Get overall platform dashboard analytics & financial statistics
   */
  async getPlatformStats() {
    const response = await axiosClient.get('/api/admin/stats');
    return response.data;
  },

  /**
   * Get all orders across the system (Admin Platform Orders)
   */
  async getAllOrders() {
    const response = await axiosClient.get('/api/admin/orders');
    return response.data;
  },
};
// In src/services/adminService.js
export const getCustomers = async () => {
  const response = await api.get('/admin/customers');
  return response.data;
};

export default adminService;
