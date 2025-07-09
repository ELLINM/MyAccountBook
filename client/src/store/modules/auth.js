// client/src/store/modules/auth.js

import AuthService from "../../services/authService";

// Helper function to safely parse JSON from localStorage
function safelyParseJSON(jsonString) {
  if (!jsonString) {
    return null;
  }
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed === undefined) {
      return null;
    }
    return parsed;
  } catch (e) {
    console.error(
      "Error parsing JSON from localStorage:",
      e,
      "String:",
      jsonString
    );
    return null;
  }
}

const state = {
  user: safelyParseJSON(localStorage.getItem("user")),
  token: localStorage.getItem("token") || null,
  authStatus: "",
  error: null,
};

const getters = {
  isAuthenticated: (state) => !!state.token,
  authStatus: (state) => state.authStatus,
  currentUser: (state) => state.user,
  authError: (state) => state.error,
  getToken: (state) => state.token,
};

const actions = {
  // ... (login, register, logout actions) ...
  async login({ commit }, credentials) {
    commit("auth_request");
    try {
      const resp = await AuthService.login(credentials);
      AuthService.setAuthToken(resp.token);
      localStorage.setItem("token", resp.token);
      localStorage.setItem("user", JSON.stringify(resp.user));
      commit("auth_success", { token: resp.token, user: resp.user });
    } catch (error) {
      const errorMessage =
        error.response && error.response.data.message
          ? error.response.data.message
          : "Login failed";
      commit("auth_error", errorMessage);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw errorMessage;
    }
  },

  async register({ commit }, credentials) {
    commit("auth_request");
    try {
      await AuthService.register(credentials);
      commit("register_success");
    } catch (error) {
      const errorMessage =
        error.response && error.response.data.message
          ? error.response.data.message
          : "Registration failed";
      commit("auth_error", errorMessage);
      throw errorMessage;
    }
  },

  async logout({ commit }) {
    await AuthService.logout();
    commit("logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

const mutations = {
  auth_request(state) {
    state.authStatus = "loading";
    state.error = null;
  },
  auth_success(state, payload) {
    state.authStatus = "success";
    state.token = payload.token;
    state.user = payload.user;
    state.error = null;
  },
  register_success(state) {
    state.authStatus = "register_success";
    state.error = null;
  },
  auth_error(state, errorMessage) {
    state.authStatus = "error";
    state.token = null;
    state.user = null;
    state.error = errorMessage;
  },
  logout(state) {
    state.authStatus = "";
    state.token = null;
    state.user = null;
    state.error = null;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
