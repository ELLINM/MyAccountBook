// client/src/store/modules/auth.js

import AuthService from "../../services/authService";

// Initial state for the authentication module
const state = {
  token: localStorage.getItem("token") || null, // JWT token
  user: JSON.parse(localStorage.getItem("user")) || null, // User object
  authStatus: "", // Current authentication status (loading, success, error, register_success)
  error: null, // Stores specific error messages
};

// Getters to retrieve state information
const getters = {
  isAuthenticated: (state) => !!state.token, // Checks if a token exists
  authStatus: (state) => state.authStatus, // Returns current auth status
  currentUser: (state) => state.user, // Returns current user object
  authError: (state) => state.error, // Returns current error message
};

// Actions to perform asynchronous operations and commit mutations
const actions = {
  /**
   * Handles user login.
   * @param {object} commit - Vuex commit function.
   * @param {object} user - User credentials { email, password }.
   */
  async login({ commit }, credentials) {
    commit("auth_request"); // Set status to loading
    try {
      const resp = await AuthService.login(credentials); // { email, password }
      localStorage.setItem("token", resp.token); // Store token in local storage
      localStorage.setItem("user", JSON.stringify(resp.user)); // Store user data in local storage
      commit("auth_success", resp.token, resp.user); // Set status to success
    } catch (error) {
      // Set specific error message from backend or a generic one
      const errorMessage =
        error.response && error.response.data.message
          ? error.response.data.message
          : "Login failed";
      commit("auth_error", errorMessage); // Set status to error and store message
      localStorage.removeItem("token"); // Clear token on error
      localStorage.removeItem("user"); // Clear user on error
      throw errorMessage; // Re-throw the message to be caught by the component
    }
  },

  /**
   * Handles user registration.
   * @param {object} commit - Vuex commit function.
   * @param {object} user - User credentials { email, password }.
   */
  async register({ commit }, credentials) {
    commit("auth_request"); // Set status to loading
    try {
      // No longer assigning the return value to a variable if not used,
      // to resolve the 'no-unused-vars' ESLint error.
      await AuthService.register(credentials); // { email, password }

      // Committing 'register_success' mutation to update status
      commit("register_success");

      // If registration returns token/user immediately and you want to log in directly:
      // const resp = await AuthService.register(user.email, user.password); // Uncomment if you need 'resp'
      // localStorage.setItem('token', resp.token);
      // localStorage.setItem('user', JSON.stringify(resp.user));
      // commit('auth_success', resp.token, resp.user);
    } catch (error) {
      // Set specific error message from backend or a generic one
      const errorMessage =
        error.response && error.response.data.message
          ? error.response.data.message
          : "Registration failed";
      commit("auth_error", errorMessage); // Set status to error and store message
      throw errorMessage; // Re-throw the message to be caught by the component
    }
  },

  /**
   * Handles user logout.
   * @param {object} commit - Vuex commit function.
   */
  async logout({ commit }) {
    await AuthService.logout(); // Call backend logout service
    commit("logout"); // Clear authentication state
    localStorage.removeItem("token"); // Remove token from local storage
    localStorage.removeItem("user"); // Remove user from local storage
  },
};

// Mutations to directly modify the state
const mutations = {
  /**
   * Sets authentication status to 'loading'.
   * @param {object} state - Current state.
   */
  auth_request(state) {
    state.authStatus = "loading";
    state.error = null; // Clear previous errors
  },
  /**
   * Sets authentication status to 'success' and stores token/user.
   * @param {object} state - Current state.
   * @param {string} token - JWT token.
   * @param {object} user - User object.
   */
  auth_success(state, token, user) {
    state.authStatus = "success";
    state.token = token;
    state.user = user;
    state.error = null;
  },
  /**
   * Sets authentication status to 'register_success' after successful registration.
   * @param {object} state - Current state.
   */
  register_success(state) {
    state.authStatus = "register_success";
    state.error = null;
  },
  /**
   * Sets authentication status to 'error' and stores the error message.
   * @param {object} state - Current state.
   * @param {string} errorMessage - Error message from the authentication attempt.
   */
  auth_error(state, errorMessage) {
    state.authStatus = "error";
    state.token = null; // Clear token on error
    state.user = null; // Clear user on error
    state.error = errorMessage;
  },
  /**
   * Clears authentication state upon logout.
   * @param {object} state - Current state.
   */
  logout(state) {
    state.authStatus = "";
    state.token = null;
    state.user = null;
    state.error = null;
  },
};

// Export the module with namespacing
export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
