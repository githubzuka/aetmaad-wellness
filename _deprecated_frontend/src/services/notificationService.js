import axiosClient from '../api/axiosClient.js';

const notificationService = {
  /**
   * Get user notifications
   */
  async getUserNotifications() {
    const response = await axiosClient.get('/api/notifications');
    return response.data;
  },

  /**
   * Get admin notifications (including Weekly Shop Feedback notifications)
   */
  async getAdminNotifications() {
    const response = await axiosClient.get('/api/admin/notifications');
    return response.data;
  },

  /**
   * Mark a notification as read
   * @param {string} id - Notification ObjectId
   */
  async markAsRead(id) {
    const response = await axiosClient.patch(`/api/admin/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const response = await axiosClient.put('/api/notifications/read-all');
    return response.data;
  },
};

export default notificationService;
