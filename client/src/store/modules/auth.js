// client/src/store/modules/auth.js

import authService from "@/services/authService";

const state = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  authStatus: "", // 'loading', 'success', 'error'
};

const getters = {
  isAuthenticated: (state) => !!state.token, // True if token exists
  authStatus: (state) => state.authStatus,
  currentUser: (state) => state.user,
  getToken: (state) => state.token,
};

const actions = {
  async login({ commit }, userCredentials) {
    commit("auth_request");
    try {
      const response = await authService.login(userCredentials);
      const token = response.token;
      const user = { _id: response._id, email: response.email };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      commit("auth_success", { token, user });
      return response;
    } catch (error) {
      commit("auth_error");
      throw error;
    }
  },

  async register({ commit }, userDetails) {
    commit("auth_request");
    try {
      const response = await authService.register(userDetails);
      commit("register_success");
      return response;
    } catch (error) {
      commit("auth_error");
      throw error;
    }
  },

  async logout({ commit }) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    commit("logout");
  },
};

const mutations = {
  auth_request(state) {
    state.authStatus = "loading";
  },
  auth_success(state, { token, user }) {
    state.authStatus = "success";
    state.token = token;
    state.user = user;
  },
  auth_error(state) {
    state.authStatus = "error";
    state.token = null;
    state.user = null;
  },
  register_success(state) {
    state.authStatus = "success";
  },
  logout(state) {
    state.authStatus = "";
    state.token = null;
    state.user = null;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
