import axiosClient from '../api/axiosClient.js';

/**
 * Service for Admin Management & Platform Analytics API requests
 */
const adminService = {
  /**
   * Get list of volunteers (Supports status filter e.g. { status: 'pending' })
   */
  async getVolunteers(params = {}) {
    const response = await axiosClient.get('/api/admin/volunteers', { params });
    return response.data;
  },

  /**
   * Get pending volunteer registrations
   */
  async getPendingVolunteers() {
    return this.getVolunteers({ status: 'pending' });
  },

  /**
   * Get all registered customers
   */
  async getCustomers() {
    const response = await axiosClient.get('/api/admin/customers');
    return response.data;
  },

  /**
   * Approve or reject a volunteer application
   */
  async updateVolunteerStatus(volunteerId, status) {
    const response = await axiosClient.put(`/api/admin/volunteers/${volunteerId}/status`, { status });
    return response.data;
  },

  /**
   * Reassign a shop to a volunteer
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
   * Get all orders across the system
   */
  async getAllOrders() {
    const response = await axiosClient.get('/api/admin/orders');
    return response.data;
  },
};

export const getCustomers = adminService.getCustomers;
export default adminService;