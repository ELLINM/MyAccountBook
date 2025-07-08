// client/src/store/modules/transactions.js

import transactionsService from "../../services/transactionsService.js";

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
      console.log(
        "Vuex (transactions module): Token fetched from auth module:",
        token
      );
      transactionsService.setAuthToken(token);
      // Calls the getTransactions method from the service, which handles Axios configuration and token.
      const responseData = await transactionsService.getTransactions();
      commit("transactions_success", responseData);
      return responseData;
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
      transactionsService.setAuthToken(token);
      const responseData =
        await transactionsService.addTransaction(transactionData);
      commit("add_transaction_success", responseData);
      return responseData;
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
      transactionsService.setAuthToken(token);
      const responseData = await transactionsService.updateTransaction(
        id,
        transactionData
      );
      commit("update_transaction_success", responseData);
      return responseData;
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
      transactionsService.setAuthToken(token);
      await transactionsService.deleteTransaction(id);
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
