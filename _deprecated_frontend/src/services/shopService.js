import axiosClient from '../api/axiosClient.js';

/**
 * Service for handling Shop & Product Management API requests
 */
const shopService = {
  /**
   * Get shops list (Supports zone/city filter e.g. { city: 'Mumbai' })
   * @param {Object} [params] - Query parameters { city, search }
   */
  async getShops(params = {}) {
    const response = await axiosClient.get('/api/shops', { params });
    return response.data;
  },

  /**
   * Get single shop details by ID
   * @param {string} id - Shop ObjectId
   */
  async getShopById(id) {
    const response = await axiosClient.get(`/api/shops/${id}`);
    return response.data;
  },

  /**
   * Create a new shop (Volunteer/Admin)
   * @param {Object} shopData - { name, address, city, ownerName, contactNumber, volunteerId }
   */
  async createShop(shopData) {
    const response = await axiosClient.post('/api/shops', shopData);
    return response.data;
  },

  /**
   * Update shop details (Automatically touches lastUpdated timestamp)
   * @param {string} id - Shop ObjectId
   * @param {Object} shopData - Updated shop fields
   */
  async updateShop(id, shopData) {
    const response = await axiosClient.put(`/api/shops/${id}`, shopData);
    return response.data;
  },

  /**
   * Delete or deactivate shop
   * @param {string} id - Shop ObjectId
   */
  async deleteShop(id) {
    const response = await axiosClient.delete(`/api/shops/${id}`);
    return response.data;
  },

  /**
   * Submit weekly shop feedback (Volunteer/Admin)
   * @param {string} shopId - Shop ObjectId
   * @param {Object} feedbackData - { status, suppliesNote, notes }
   */
  async submitShopFeedback(shopId, feedbackData) {
    const response = await axiosClient.post(`/api/shops/${shopId}/feedback`, feedbackData);
    return response.data;
  },

  /**
   * Get feedback history for a shop
   * @param {string} shopId - Shop ObjectId
   */
  async getShopFeedbackHistory(shopId) {
    const response = await axiosClient.get(`/api/shops/${shopId}/feedback`);
    return response.data;
  },

  /**
   * Get products for a given shop
   * @param {string} shopId - Shop ObjectId
   */
  async getProductsByShop(shopId) {
    const response = await axiosClient.get(`/api/shops/${shopId}/products`);
    return response.data;
  },

  /**
   * Add a new product to shop inventory
   * @param {string} shopId - Shop ObjectId
   * @param {Object} productData - { name, description, retailPrice, bulkPrice, stock }
   */
  async createProduct(shopId, productData) {
    const response = await axiosClient.post(`/api/shops/${shopId}/products`, productData);
    return response.data;
  },

  /**
   * Update existing product details
   * @param {string} productId - Product ObjectId
   * @param {Object} productData - Updated product fields
   */
  async updateProduct(productId, productData) {
    const response = await axiosClient.put(`/api/products/${productId}`, productData);
    return response.data;
  },

  /**
   * Remove a product from shop
   * @param {string} productId - Product ObjectId
   */
  async deleteProduct(productId) {
    const response = await axiosClient.delete(`/api/products/${productId}`);
    return response.data;
  },
};

export default shopService;
