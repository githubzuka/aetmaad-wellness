import axiosClient from '../api/axiosClient.js';

/**
 * Service for fetching & managing products
 */
const productService = {
  /**
   * Get all products across platform
   */
  async getAllProducts() {
    const response = await axiosClient.get('/api/products');
    return response.data;
  },

  /**
   * Get single product by ID
   * @param {string} id - Product ObjectId
   */
  async getProductById(id) {
    const response = await axiosClient.get(`/api/products/${id}`);
    return response.data;
  },
};

export default productService;
