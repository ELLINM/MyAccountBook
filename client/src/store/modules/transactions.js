// client/src/store/modules/transactions.js
const state = {
  transactions: [], // Array to store transaction objects
  currentTransaction: null, // For viewing/editing a single transaction
  status: "", // 'loading', 'success', 'error'
};

const getters = {
  allTransactions: (state) => state.transactions,
  transactionStatus: (state) => state.status,
};

const actions = {
  // Action to fetch all transactions
  async fetchTransactions({ commit }) {
    commit("transactions_request");
    try {
      // API call to backend: GET /api/transactions
      // const response = await axios.get('/api/transactions');
      // commit('transactions_success', response.data);

      // Mock data for now
      const mockTransactions = [
        {
          _id: "t1",
          date: new Date(),
          amount: 15000,
          type: "expense",
          category: { id: "c1", name: "Food" },
          description: "Lunch",
        },
        {
          _id: "t2",
          date: new Date(),
          amount: 50000,
          type: "income",
          category: { id: "c2", name: "Salary" },
          description: "Monthly salary",
        },
      ];
      commit("transactions_success", mockTransactions);
    } catch (error) {
      commit("transactions_error");
    }
  },
  // Action to add a new transaction
  async addTransaction({ commit }, _transactionData) {
    commit("transactions_request");
    try {
      // API call to backend: POST /api/transactions
      // const response = await axios.post('/api/transactions', _transactionData);
      // commit('add_transaction_success', response.data);
      // For mock: assume success
      commit("transactions_success"); // Just set status to success for now
    } catch (error) {
      commit("transactions_error");
    }
  },
  // Action to update a transaction
  async updateTransaction(
    { commit },
    { id: _id, transactionData: _transactionData }
  ) {
    commit("transactions_request");
    try {
      // API call to backend: PUT /api/transactions/:id
      // const response = await axios.put(`/api/transactions/${_id}`, _transactionData);
      // commit('update_transaction_success', response.data);
      // For mock: assume success
      commit("transactions_success");
    } catch (error) {
      commit("transactions_error");
    }
  },
  // Action to delete a transaction
  async deleteTransaction({ commit }, _id) {
    commit("transactions_request");
    try {
      // API call to backend: DELETE /api/transactions/:id
      // await axios.delete(`/api/transactions/${_id}`);
      // commit('delete_transaction_success', _id);
      // For mock: assume success
      commit("transactions_success");
    } catch (error) {
      commit("transactions_error");
    }
  },
};

const mutations = {
  transactions_request(state) {
    state.status = "loading";
  },
  transactions_success(state, transactions) {
    state.status = "success";
    if (transactions) {
      // Only update if data is provided (e.g., from fetch)
      state.transactions = transactions;
    }
  },
  transactions_error(state) {
    state.status = "error";
  },
  // Consider specific mutations for add, update, delete for better reactivity
  // add_transaction_success(state, newTransaction) {
  //   state.transactions.push(newTransaction);
  // },
  // update_transaction_success(state, updatedTransaction) {
  //   const index = state.transactions.findIndex(t => t._id === updatedTransaction._id);
  //   if (index !== -1) {
  //     state.transactions.splice(index, 1, updatedTransaction);
  //   }
  // },
  // delete_transaction_success(state, id) {
  //   state.transactions = state.transactions.filter(t => t._id !== id);
  // },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
