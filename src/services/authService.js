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
   * How many recent failed login attempts an account has.
   * Used by the login page to warn before the lockout takes effect.
   */
  async getLoginAttempts(email) {
    const response = await axiosClient.get('/api/auth/login-attempts', { params: { email } });
    return response.data;
  },

  /**
   * Get logged-in user profile
   */
  async getProfile() {
    const response = await axiosClient.get('/api/auth/profile');
    return response.data;
  },

  async applyVolunteer(applicationData) {
    const response = await axiosClient.post('/api/auth/apply-volunteer', applicationData);
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

  /**
   * Request a password reset. The request is routed to the admin team who
   * verify identity and reset the account.
   * @param {Object} payload - { email, note }
   */
  async requestPasswordReset(payload) {
    const response = await axiosClient.post('/api/auth/forgot-password', payload);
    return response.data;
  },

  /**
   * Admin: reset another user's password
   * @param {string} userId
   * @param {string} newPassword
   */
  async adminResetPassword(userId, newPassword) {
    const response = await axiosClient.patch(`/api/auth/users/${userId}/password`, { newPassword });
    return response.data;
  },
};

export default authService;
