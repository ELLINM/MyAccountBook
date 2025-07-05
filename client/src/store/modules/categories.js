// client/src/store/modules/categories.js

import axios from "axios";

const API_URL = process.env.VUE_APP_API_URL;

const state = {
  categories: [],
  status: "", // 'loading', 'success', 'error'
  error: null,
};

const getters = {
  allCategories: (state) => state.categories,
  categoryStatus: (state) => state.status,
  categoryError: (state) => state.error,
};

const actions = {
  async fetchCategories({ commit, rootGetters }) {
    commit("categories_request");
    try {
      const token = rootGetters["auth/getToken"];
      const response = await axios.get(`${API_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      commit("categories_success", response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      commit("categories_error", message);
      throw message;
    }
  },

  async addCategory({ commit, rootGetters }, categoryData) {
    commit("categories_request");
    try {
      const token = rootGetters["auth/getToken"];
      const response = await axios.post(`${API_URL}/categories`, categoryData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      commit("add_category_success", response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      commit("categories_error", message);
      throw message;
    }
  },

  async updateCategory({ commit, rootGetters }, { id, categoryData }) {
    commit("categories_request");
    try {
      const token = rootGetters["auth/getToken"];
      const response = await axios.put(
        `${API_URL}/categories/${id}`,
        categoryData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      commit("update_category_success", response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      commit("categories_error", message);
      throw message;
    }
  },

  async deleteCategory({ commit, rootGetters }, id) {
    commit("categories_request");
    try {
      const token = rootGetters["auth/getToken"];
      await axios.delete(`${API_URL}/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      commit("delete_category_success", id);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      commit("categories_error", message);
      throw message;
    }
  },
};

const mutations = {
  categories_request(state) {
    state.status = "loading";
    state.error = null;
  },
  categories_success(state, categories) {
    state.status = "success";
    state.categories = categories;
    state.error = null;
  },
  categories_error(state, message) {
    state.status = "error";
    state.categories = [];
    state.error = message;
  },
  add_category_success(state, newCategory) {
    state.status = "success";
    state.categories.push(newCategory);
    state.error = null;
  },
  update_category_success(state, updatedCategory) {
    state.status = "success";
    const index = state.categories.findIndex(
      (c) => c._id === updatedCategory._id
    );
    if (index !== -1) {
      state.categories.splice(index, 1, updatedCategory);
    }
    state.error = null;
  },
  delete_category_success(state, id) {
    state.status = "success";
    state.categories = state.categories.filter((c) => c._id !== id);
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
