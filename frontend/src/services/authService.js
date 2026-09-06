import axiosClient from '../api/axiosClient.js';

/**
 * Service for handling User Authentication & Profile API requests
 */
const authService = {
  /**
   * Register a new user (Customer or Volunteer)
   * @param {Object} userData - { name, email, password, contactNumber, address, city, role }
   */
  async register(userData) {
    const response = await axiosClient.post('/api/auth/register', userData);
    return response.data;
  },

  /**
   * Login user and obtain token
   * @param {Object} credentials - { email, password }
   */
  async login(credentials) {
    const response = await axiosClient.post('/api/auth/login', credentials);
    return response.data;
  },

  /**
   * Get logged-in user profile
   */
  async getProfile() {
    const response = await axiosClient.get('/api/auth/profile');
    return response.data;
  },

  /**
   * Update logged-in user profile
   * @param {Object} profileData - { name, contactNumber, address, city, password }
   */
  async updateProfile(profileData) {
    const response = await axiosClient.put('/api/auth/profile', profileData);
    return response.data;
  },
};

export default authService;
