// client/src/store/modules/transactions.js

import axios from "axios";

const API_URL = process.env.VUE_APP_API_URL;

const state = {
  transactions: [],
  currentTransaction: null,
  status: "", // 'loading', 'success', 'error'
  error: null,
};

const getters = {
  allTransactions: (state) => state.transactions,
  transactionStatus: (state) => state.status,
  transactionError: (state) => state.error,
  currentTransaction: (state) => state.currentTransaction,
};

const actions = {
  async fetchTransactions({ commit, rootGetters }) {
    commit("transactions_request");
    try {
      const token = rootGetters["auth/getToken"];
      const response = await axios.get(`${API_URL}/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      commit("transactions_success", response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      commit("transactions_error", message);
      throw message;
    }
  },

  async addTransaction({ commit, rootGetters }, transactionData) {
    commit("transactions_request");
    try {
      const token = rootGetters["auth/getToken"];
      const response = await axios.post(
        `${API_URL}/transactions`,
        transactionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      commit("add_transaction_success", response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      commit("transactions_error", message);
      throw message;
    }
  },

  async updateTransaction({ commit, rootGetters }, { id, transactionData }) {
    commit("transactions_request");
    try {
      const token = rootGetters["auth/getToken"];
      const response = await axios.put(
        `${API_URL}/transactions/${id}`,
        transactionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      commit("update_transaction_success", response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      commit("transactions_error", message);
      throw message;
    }
  },

  async deleteTransaction({ commit, rootGetters }, id) {
    commit("transactions_request");
    try {
      const token = rootGetters["auth/getToken"];
      await axios.delete(`${API_URL}/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      commit("delete_transaction_success", id);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      commit("transactions_error", message);
      throw message;
    }
  },
};

const mutations = {
  transactions_request(state) {
    state.status = "loading";
    state.error = null;
  },
  transactions_success(state, transactions) {
    state.status = "success";
    state.transactions = transactions;
    state.error = null;
  },
  transactions_error(state, message) {
    state.status = "error";
    state.transactions = [];
    state.error = message;
  },
  add_transaction_success(state, newTransaction) {
    state.status = "success";
    state.transactions.push(newTransaction);
    state.error = null;
  },
  update_transaction_success(state, updatedTransaction) {
    state.status = "success";
    const index = state.transactions.findIndex(
      (t) => t._id === updatedTransaction._id
    );
    if (index !== -1) {
      state.transactions.splice(index, 1, updatedTransaction);
    }
    state.error = null;
  },
  delete_transaction_success(state, id) {
    state.status = "success";
    state.transactions = state.transactions.filter((t) => t._id !== id);
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
