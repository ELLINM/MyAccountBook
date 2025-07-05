// client/src/services/authService.js

import axios from "axios";

const API_URL = process.env.VUE_APP_API_URL;

const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response.data.message || error.message;
  }
};

const login = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, userData);
    return response.data;
  } catch (error) {
    throw error.response.data.message || error.message;
  }
};

const logout = () => {
  // No API call needed for logout in our current backend setup
};

export default {
  register,
  login,
  logout,
};
