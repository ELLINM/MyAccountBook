// client/src/services/authService.js

import axios from "axios";

// Base URL for the backend API, typically from environment variables.
const API_URL = process.env.VUE_APP_API_URL; // This is now http://localhost:5000

/**
 * Registers a new user by sending data to the backend.
 * @param {object} userData - Object containing user's registration data (e.g., { email, password }).
 * @returns {Promise<object>} - A promise that resolves with the response data on success.
 * @throws {string} - Throws an error message on failure.
 */
const register = async (userData) => {
  try {
    // Corrected URL: Add '/api' back here
    const response = await axios.post(
      `${API_URL}/api/auth/register`,
      userData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response.data.message || error.message;
  }
};

/**
 * Logs in a user by sending credentials to the backend.
 * @param {object} userData - Object containing user's login credentials (e.g., { email, password }).
 * @returns {Promise<object>} - A promise that resolves with user data and token on success.
 * @throws {string} - Throws an error message on failure.
 */
const login = async (userData) => {
  try {
    // Corrected URL: Add '/api' back here
    const response = await axios.post(`${API_URL}/api/auth/login`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data.message || error.message;
  }
};

/**
 * Handles user logout. In this current backend setup, no API call is needed for logout.
 * This function can be extended if the backend requires a logout endpoint call (e.g., for session invalidation).
 */
const logout = () => {
  // No API call needed for logout in our current backend setup
};

export default {
  register,
  login,
  logout,
};
