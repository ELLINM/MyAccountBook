// client/tests/unit/transactions.spec.js
import transactionsModule from "@/store/modules/transactions";
import transactionsService from "@/services/transactionsService"; // Import the actual service to mock it

// Mock the transactionsService dependency.
// This is necessary because the transactions.js module calls transactionsService.setAuthToken()
// and other methods like getTransactions(), addTransaction(), etc.
jest.mock("@/services/transactionsService", () => ({
  setAuthToken: jest.fn(), // Mock the setAuthToken method
  getTransactions: jest.fn(), // Mock the getTransactions method
  addTransaction: jest.fn(), // Mock the addTransaction method
  updateTransaction: jest.fn(), // Mock the updateTransaction method
  deleteTransaction: jest.fn(), // Mock the deleteTransaction method
}));

describe("transactions Vuex Module", () => {
  let commit;
  let rootGetters;
  let state;

  beforeEach(() => {
    // Reset mocks and state before each test.
    jest.clearAllMocks(); // Clear all Jest mock call records.
    commit = jest.fn(); // Mock the `commit` function.
    // Mock `rootGetters` to ensure `auth/getToken` returns a token.
    rootGetters = { "auth/getToken": "mock-jwt-token" };
    // Create a fresh copy of the initial state for each test.
    state = { ...transactionsModule.state };

    // Spy on and mock `console.log` calls to prevent them from appearing in test output.
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore the original `console.log` after each test.
    jest.restoreAllMocks();
  });

  // --- Getters tests ---
  describe("getters", () => {
    it("allTransactions returns transactions from state", () => {
      state.transactions = [{ id: "1", description: "Groceries" }];
      const result = transactionsModule.getters.allTransactions(state);
      expect(result).toEqual([{ id: "1", description: "Groceries" }]);
    });

    it("transactionStatus returns status from state", () => {
      state.status = "loading";
      const result = transactionsModule.getters.transactionStatus(state);
      expect(result).toBe("loading");
    });

    it("transactionError returns error from state", () => {
      state.error = "Test error";
      const result = transactionsModule.getters.transactionError(state);
      expect(result).toBe("Test error");
    });

    it("currentTransaction returns currentTransaction from state", () => {
      state.currentTransaction = { id: "1", description: "Expense" };
      const result = transactionsModule.getters.currentTransaction(state);
      expect(result).toEqual({ id: "1", description: "Expense" });
    });
  });

  // --- Mutations tests ---
  describe("mutations", () => {
    it("transactions_request sets status to loading and clears error", () => {
      state.status = "success";
      state.error = "Previous error";
      transactionsModule.mutations.transactions_request(state);
      expect(state.status).toBe("loading");
      expect(state.error).toBeNull();
    });

    it("transactions_success sets status to success and updates transactions", () => {
      const mockTransactions = [{ _id: "1", description: "Mock Trans" }];
      transactionsModule.mutations.transactions_success(
        state,
        mockTransactions
      );
      expect(state.status).toBe("success");
      expect(state.transactions).toEqual(mockTransactions);
      expect(state.error).toBeNull();
    });

    it("transactions_error sets status to error, clears transactions and sets error message", () => {
      const errorMessage = "API failed";
      state.transactions = [{ _id: "1", description: "Existing Trans" }];
      transactionsModule.mutations.transactions_error(state, errorMessage);
      expect(state.status).toBe("error");
      expect(state.transactions).toEqual([]);
      expect(state.error).toBe(errorMessage);
    });

    it("add_transaction_success adds a new transaction to the list", () => {
      state.transactions = [{ _id: "1", description: "Existing" }];
      const newTransaction = { _id: "2", description: "New" };
      transactionsModule.mutations.add_transaction_success(
        state,
        newTransaction
      );
      expect(state.status).toBe("success");
      expect(state.transactions).toEqual([
        { _id: "1", description: "Existing" },
        { _id: "2", description: "New" },
      ]);
      expect(state.error).toBeNull();
    });

    it("update_transaction_success updates an existing transaction", () => {
      state.transactions = [
        { _id: "1", description: "Old" },
        { _id: "2", description: "Other" },
      ];
      const updatedTransaction = { _id: "1", description: "Updated" };
      transactionsModule.mutations.update_transaction_success(
        state,
        updatedTransaction
      );
      expect(state.status).toBe("success");
      expect(state.transactions).toEqual([
        { _id: "1", description: "Updated" },
        { _id: "2", description: "Other" },
      ]);
      expect(state.error).toBeNull();
    });

    it("update_transaction_success does nothing if transaction not found", () => {
      state.transactions = [{ _id: "1", description: "Old" }];
      const updatedTransaction = { _id: "99", description: "NonExistent" };
      transactionsModule.mutations.update_transaction_success(
        state,
        updatedTransaction
      );
      expect(state.status).toBe("success");
      expect(state.transactions).toEqual([{ _id: "1", description: "Old" }]); // Should remain unchanged
      expect(state.error).toBeNull();
    });

    it("delete_transaction_success removes a transaction from the list", () => {
      state.transactions = [
        { _id: "1", description: "To Delete" },
        { _id: "2", description: "Keep" },
      ];
      transactionsModule.mutations.delete_transaction_success(state, "1");
      expect(state.status).toBe("success");
      expect(state.transactions).toEqual([{ _id: "2", description: "Keep" }]);
      expect(state.error).toBeNull();
    });
  });

  // --- Actions tests ---
  describe("actions", () => {
    // fetchTransactions
    it("fetchTransactions commits success and returns data on success", async () => {
      const mockTransactions = [{ _id: "1", description: "Food" }];
      transactionsService.getTransactions.mockResolvedValueOnce(
        mockTransactions
      );

      const result = await transactionsModule.actions.fetchTransactions({
        commit,
        rootGetters,
      });

      expect(commit).toHaveBeenCalledWith("transactions_request");
      expect(transactionsService.setAuthToken).toHaveBeenCalledWith(
        "mock-jwt-token"
      );
      expect(transactionsService.getTransactions).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(
        "transactions_success",
        mockTransactions
      );
      expect(result).toEqual(mockTransactions);
    });

    it("fetchTransactions commits error and throws on failure with response data message", async () => {
      const errorMessage = "API fetch failed";
      const mockError = { response: { data: { message: errorMessage } } };
      transactionsService.getTransactions.mockRejectedValueOnce(mockError);

      await expect(
        transactionsModule.actions.fetchTransactions({ commit, rootGetters })
      ).rejects.toBe(errorMessage);

      expect(commit).toHaveBeenCalledWith("transactions_request");
      expect(transactionsService.setAuthToken).toHaveBeenCalledWith(
        "mock-jwt-token"
      );
      expect(transactionsService.getTransactions).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith("transactions_error", errorMessage);
    });

    it("fetchTransactions commits error and throws on failure with generic error message", async () => {
      const genericError = new Error("Network Error");
      transactionsService.getTransactions.mockRejectedValueOnce(genericError);

      await expect(
        transactionsModule.actions.fetchTransactions({ commit, rootGetters })
      ).rejects.toBe("Network Error");

      expect(commit).toHaveBeenCalledWith("transactions_request");
      expect(transactionsService.setAuthToken).toHaveBeenCalledWith(
        "mock-jwt-token"
      );
      expect(transactionsService.getTransactions).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(
        "transactions_error",
        "Network Error"
      );
    });

    // addTransaction
    it("addTransaction commits success and returns new transaction on success", async () => {
      const newTransactionData = { description: "New Transaction" };
      const returnedTransaction = { _id: "newId", ...newTransactionData };
      transactionsService.addTransaction.mockResolvedValueOnce(
        returnedTransaction
      );

      const result = await transactionsModule.actions.addTransaction(
        { commit, rootGetters },
        newTransactionData
      );

      expect(commit).toHaveBeenCalledWith("transactions_request");
      expect(transactionsService.setAuthToken).toHaveBeenCalledWith(
        "mock-jwt-token"
      );
      expect(transactionsService.addTransaction).toHaveBeenCalledWith(
        newTransactionData
      );
      expect(commit).toHaveBeenCalledWith(
        "add_transaction_success",
        returnedTransaction
      );
      expect(result).toEqual(returnedTransaction);
    });

    it("addTransaction commits error and throws on failure with response data message", async () => {
      const errorMessage = "Add transaction failed";
      const mockError = { response: { data: { message: errorMessage } } };
      transactionsService.addTransaction.mockRejectedValueOnce(mockError);

      await expect(
        transactionsModule.actions.addTransaction({ commit, rootGetters }, {})
      ).rejects.toBe(errorMessage);

      expect(commit).toHaveBeenCalledWith("transactions_request");
      expect(transactionsService.setAuthToken).toHaveBeenCalledWith(
        "mock-jwt-token"
      );
      expect(transactionsService.addTransaction).toHaveBeenCalledWith({});
      expect(commit).toHaveBeenCalledWith("transactions_error", errorMessage);
    });

    it("addTransaction commits error and throws on failure with generic error message", async () => {
      const genericError = new Error("Network Error on Add");
      transactionsService.addTransaction.mockRejectedValueOnce(genericError);

      await expect(
        transactionsModule.actions.addTransaction({ commit, rootGetters }, {})
      ).rejects.toBe("Network Error on Add");

      expect(commit).toHaveBeenCalledWith("transactions_request");
      expect(transactionsService.setAuthToken).toHaveBeenCalledWith(
        "mock-jwt-token"
      );
      expect(transactionsService.addTransaction).toHaveBeenCalledWith({});
      expect(commit).toHaveBeenCalledWith(
        "transactions_error",
        "Network Error on Add"
      );
    });

    // updateTransaction
    it("updateTransaction commits success and returns updated transaction on success", async () => {
      const transactionId = "updateId";
      const updatedData = { description: "Updated Transaction" };
      const returnedTransaction = { _id: transactionId, ...updatedData };
      transactionsService.updateTransaction.mockResolvedValueOnce(
        returnedTransaction
      );

      const result = await transactionsModule.actions.updateTransaction(
        { commit, rootGetters },
        { id: transactionId, transactionData: updatedData }
      );

      expect(commit).toHaveBeenCalledWith("transactions_request");
      expect(transactionsService.setAuthToken).toHaveBeenCalledWith(
        "mock-jwt-token"
      );
      expect(transactionsService.updateTransaction).toHaveBeenCalledWith(
        transactionId,
        updatedData
      );
      expect(commit).toHaveBeenCalledWith(
        "update_transaction_success",
        returnedTransaction
      );
      expect(result).toEqual(returnedTransaction);
    });

    it("updateTransaction commits error and throws on failure with response data message", async () => {
      const errorMessage = "Update transaction failed";
      const mockError = { response: { data: { message: errorMessage } } };
      transactionsService.updateTransaction.mockRejectedValueOnce(mockError);

      await expect(
        transactionsModule.actions.updateTransaction(
          { commit, rootGetters },
          { id: "someId", transactionData: {} }
        )
      ).rejects.toBe(errorMessage);

      expect(commit).toHaveBeenCalledWith("transactions_request");
      expect(transactionsService.setAuthToken).toHaveBeenCalledWith(
        "mock-jwt-token"
      );
      expect(transactionsService.updateTransaction).toHaveBeenCalledWith(
        "someId",
        {}
      );
      expect(commit).toHaveBeenCalledWith("transactions_error", errorMessage);
    });

    it("updateTransaction commits error and throws on failure with generic error message", async () => {
      const genericError = new Error("Network Error on Update");
      transactionsService.updateTransaction.mockRejectedValueOnce(genericError);

      await expect(
        transactionsModule.actions.updateTransaction(
          { commit, rootGetters },
          { id: "someId", transactionData: {} }
        )
      ).rejects.toBe("Network Error on Update");

      expect(commit).toHaveBeenCalledWith("transactions_request");
      expect(transactionsService.setAuthToken).toHaveBeenCalledWith(
        "mock-jwt-token"
      );
      expect(transactionsService.updateTransaction).toHaveBeenCalledWith(
        "someId",
        {}
      );
      expect(commit).toHaveBeenCalledWith(
        "transactions_error",
        "Network Error on Update"
      );
    });

    // deleteTransaction
    it("deleteTransaction commits success and returns deleted id on success", async () => {
      const transactionId = "deleteId";
      transactionsService.deleteTransaction.mockResolvedValueOnce({}); // delete usually returns empty object or status

      const result = await transactionsModule.actions.deleteTransaction(
        { commit, rootGetters },
        transactionId
      );

      expect(commit).toHaveBeenCalledWith("transactions_request");
      expect(transactionsService.setAuthToken).toHaveBeenCalledWith(
        "mock-jwt-token"
      );
      expect(transactionsService.deleteTransaction).toHaveBeenCalledWith(
        transactionId
      );
      expect(commit).toHaveBeenCalledWith(
        "delete_transaction_success",
        transactionId
      );
      expect(result).toBe(transactionId);
    });

    it("deleteTransaction commits error and throws on failure with response data message", async () => {
      const errorMessage = "Delete transaction failed";
      const mockError = { response: { data: { message: errorMessage } } };
      transactionsService.deleteTransaction.mockRejectedValueOnce(mockError);

      await expect(
        transactionsModule.actions.deleteTransaction(
          { commit, rootGetters },
          "someId"
        )
      ).rejects.toBe(errorMessage);

      expect(commit).toHaveBeenCalledWith("transactions_request");
      expect(transactionsService.setAuthToken).toHaveBeenCalledWith(
        "mock-jwt-token"
      );
      expect(transactionsService.deleteTransaction).toHaveBeenCalledWith(
        "someId"
      );
      expect(commit).toHaveBeenCalledWith("transactions_error", errorMessage);
    });

    it("deleteTransaction commits error and throws on failure with generic error message", async () => {
      const genericError = new Error("Network Error on Delete");
      transactionsService.deleteTransaction.mockRejectedValueOnce(genericError);

      await expect(
        transactionsModule.actions.deleteTransaction(
          { commit, rootGetters },
          "someId"
        )
      ).rejects.toBe("Network Error on Delete");

      expect(commit).toHaveBeenCalledWith("transactions_request");
      expect(transactionsService.setAuthToken).toHaveBeenCalledWith(
        "mock-jwt-token"
      );
      expect(transactionsService.deleteTransaction).toHaveBeenCalledWith(
        "someId"
      );
      expect(commit).toHaveBeenCalledWith(
        "transactions_error",
        "Network Error on Delete"
      );
    });
  });
});
