import axiosClient from '../api/axiosClient.js';

/**
 * Service for handling Ordering System API requests
 */
const orderService = {
  /**
   * Place standard or bulk retail order
   * @param {Object} orderData - { shopId, orderType: 'normal' | 'bulk', items: [{ productId, quantity }] }
   */
  async createOrder(orderData) {
    const response = await axiosClient.post('/api/orders', orderData);
    return response.data;
  },

  /**
   * Place direct order by volunteer on behalf of customer/shop
   * @param {Object} orderData - { shopId, customerId, orderType, items }
   */
  async createVolunteerOrder(orderData) {
    const response = await axiosClient.post('/api/orders/volunteer', {
      ...orderData,
      placedBy: 'volunteer',
    });
    return response.data;
  },

  /**
   * Get orders for the logged-in customer or volunteer's zone
   */
  async getMyOrders() {
    const response = await axiosClient.get('/api/orders/myorders');
    return response.data;
  },

  /**
   * Get bulk orders placed by authenticated volunteer for shops
   */
  async getMyVolunteerOrders() {
    const response = await axiosClient.get('/api/orders/my-volunteer-orders');
    return response.data;
  },

  /**
   * Get orders placed at a specific shop (Volunteer/Admin)
   * @param {string} shopId - Shop ObjectId
   */
  async getShopOrders(shopId) {
    const response = await axiosClient.get(`/api/shops/${shopId}/orders`);
    return response.data;
  },

  /**
   * Get single order details by ID
   * @param {string} id - Order ObjectId
   */
  async getOrderById(id) {
    const response = await axiosClient.get(`/api/orders/${id}`);
    return response.data;
  },

  /**
   * Get all platform orders (Admin only)
   */
  async getAllOrders() {
    const response = await axiosClient.get('/api/orders/all');
    return response.data;
  },

  /**
   * Get all platform orders (Admin only)
   */
  async getAllAdminOrders(params = {}) {
    const response = await axiosClient.get('/api/admin/orders', { params });
    return response.data;
  },

  /**
   * Update order status (pending -> processing -> dispatched -> shipped -> delivered -> cancelled)
   * @param {string} id - Order ObjectId
   * @param {string} status - New order status
   */
  async updateOrderStatus(id, status) {
    const response = await axiosClient.patch(`/api/orders/${id}/status`, { status });
    return response.data;
  },
};

export default orderService;
