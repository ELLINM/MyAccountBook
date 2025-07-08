// client/src/services/transactionsService.js
import axios from "axios";

// Create an Axios instance for the transactions API.
// Use a relative path '/api/transactions' to leverage the proxy configured in vue.config.js.
const api = axios.create({
  baseURL: "/api", // Base path for the backend transactions API, relative to the proxy
});

const transactionsService = {
  setAuthToken(token) {
    console.log(
      "Vuex (transactions module): Token fetched from auth module:",
      token
    );
    if (token) {
      api.defaults.headers.common["x-auth-token"] = token;
    } else {
      delete api.defaults.headers.common["x-auth-token"];
    }
    console.log(
      "Vuex (transactions module): Token fetched from auth module:",
      token
    );
  },

  /**
   * Fetches all transactions from the backend.
   * This will be proxied from `/api/transactions/` to `http://localhost:5000/api/transactions/`.
   * @returns {Promise<Array>} A promise that resolves with an array of transaction objects.
   */
  async getTransactions() {
    const response = await api.get("/transactions");
    return response.data;
  },

  /**
   * Adds a new transaction.
   * This will be proxied from `/api/transactions/` to `http://localhost:5000/api/transactions/`.
   * @param {object} transactionData - The transaction data to add.
   * @returns {Promise<object>} A promise that resolves with the created transaction object.
   */
  async addTransaction(transactionData) {
    const response = await api.post("/transactions", transactionData);
    return response.data;
  },

  /**
   * Updates an existing transaction.
   * This will be proxied from `/api/transactions/:id` to `http://localhost:5000/api/transactions/:id`.
   * @param {string} id - The ID of the transaction to update.
   * @param {object} transactionData - The updated transaction data.
   * @returns {Promise<object>} A promise that resolves with the updated transaction object.
   */
  async updateTransaction(id, transactionData) {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  /**
   * Deletes a transaction.
   * This will be proxied from `/api/transactions/:id` to `http://localhost:5000/api/transactions/:id`.
   * @param {string} id - The ID of the transaction to delete.
   * @returns {Promise<object>} A promise that resolves with a confirmation message.
   */
  async deleteTransaction(id) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
};

export default transactionsService;
