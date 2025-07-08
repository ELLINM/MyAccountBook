// client/src/services/authService.js
import axios from "axios";

// Create an Axios instance with a base URL for the authentication API.
// This instance will specifically handle authentication-related requests.
const api = axios.create({
  baseURL: "/api/auth", // Base path for the backend authentication API, relative to the proxy
});

const AuthService = {
  /**
   * Handles user login by sending credentials to the backend.
   * On successful login, it calls setAuthToken to configure Axios for subsequent requests.
   * @param {object} credentials - User login credentials (e.g., { email, password }).
   * @returns {Promise<object>} A promise that resolves with token and user data.
   */
  async login(credentials) {
    const response = await api.post("/login", credentials);
    const { token, user } = response.data;
    // Set the token using the setAuthToken method, which now applies globally to axios.defaults
    AuthService.setAuthToken(token);
    return { token, user };
  },

  /**
   * Handles user registration.
   * @param {object} credentials - User registration details (e.g., { email, password, name }).
   * @returns {Promise<object>} A promise that resolves with registration confirmation.
   */
  async register(credentials) {
    const response = await api.post("/register", credentials);
    return response.data;
  },

  /**
   * Handles user logout.
   * Clears the authentication token from Axios global defaults.
   * @returns {Promise<object>} A promise that resolves with a logout message.
   */
  async logout() {
    // Optional: If your backend has a /logout endpoint to invalidate sessions/tokens
    // await api.post('/logout');
    // Clear the authentication token from Axios global defaults
    AuthService.setAuthToken(null);
    return { message: "Logged out successfully" };
  },

  /**
   * Sets or clears the authentication token in Axios's global default headers.
   * This ensures all subsequently created or used Axios instances (unless explicitly overridden)
   * will include or exclude this token.
   * @param {string | null} token - The JWT token to set, or null to clear.
   */
  setAuthToken(token) {
    if (token) {
      axios.defaults.headers.common["x-auth-token"] = token;
    } else {
      delete axios.defaults.headers.common["x-auth-token"];
    }
  },
};

export default AuthService;
