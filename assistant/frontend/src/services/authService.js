import axios from 'axios';

const API_BASE_URL = 'http://localhost:8100/api';

const authService = {
  // Login
  async login(email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.role);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Register
  async register(email, password, confirmPassword, role) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
        confirmPassword,
        role
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.role);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  },

  // Check if user is logged in
  isLoggedIn() {
    return !!localStorage.getItem('token');
  },

  // Get current user role
  getUserRole() {
    return localStorage.getItem('userRole');
  },

  // Get auth token
  getToken() {
    return localStorage.getItem('token');
  },

  // Set auth header for axios requests
  getAuthHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export default authService;
