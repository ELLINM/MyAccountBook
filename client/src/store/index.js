// client/src/store/index.js
import { createStore } from "vuex";
import auth from "./modules/auth.js";
import transactions from "./modules/transactions.js";
import categories from "./modules/categories.js";

export default createStore({
  // Root state (can be empty or contain global states)
  state: {
    // Global loading state, error messages, etc.
    isLoading: false,
    errorMessage: null,
  },
  // Root mutations (for changing root state)
  mutations: {
    SET_LOADING(state, status) {
      state.isLoading = status;
    },
    SET_ERROR_MESSAGE(state, message) {
      state.errorMessage = message;
    },
    CLEAR_ERROR_MESSAGE(state) {
      state.errorMessage = null;
    },
  },
  // Root actions (for asynchronous operations affecting root state)
  actions: {
    // Global actions like showing/hiding loading spinner
    showLoading({ commit }) {
      commit("SET_LOADING", true);
    },
    hideLoading({ commit }) {
      commit("SET_LOADING", false);
    },
    setErrorMessage({ commit }, message) {
      commit("SET_ERROR_MESSAGE", message);
    },
    clearErrorMessage({ commit }) {
      commit("CLEAR_ERROR_MESSAGE");
    },
  },
  // Modules for better organization
  modules: {
    auth,
    transactions,
    categories,
    // reports: reportsModule // Add later if needed
  },
});
