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
   * Get admin notifications (unread items awaiting review)
   */
  async getAdminNotifications() {
    const response = await axiosClient.get('/api/admin/notifications');
    return response.data;
  },

  /**
   * Admin inbox — notifications already seen and actioned
   */
  async getAdminInbox() {
    const response = await axiosClient.get('/api/admin/notifications/inbox');
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
