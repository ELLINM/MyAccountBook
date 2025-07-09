// client/tests/unit/transactions.spec.js
import { createStore } from "vuex";
import transactionsModule from "@/store/modules/transactions";
import transactionsService from "@/services/transactionsService";

// Mock transactionsService to prevent actual API calls
jest.mock("@/services/transactionsService", () => ({
  getTransactions: jest.fn(),
  addTransaction: jest.fn(),
  updateTransaction: jest.fn(),
  deleteTransaction: jest.fn(),
  setAuthToken: jest.fn(),
}));

describe("Transactions Vuex Module", () => {
  let store;
  const mockToken = "mock-jwt-token";

  beforeEach(() => {
    store = createStore({
      modules: {
        transactions: {
          namespaced: true,
          ...transactionsModule,
        },
        auth: {
          namespaced: true,
          getters: {
            getToken: () => mockToken,
          },
        },
      },
    });
    jest.clearAllMocks();
  });

  it("fetchTransactions action commits transactions_success on successful API call", async () => {
    const mockTransactions = [
      { _id: "1", description: "Groceries", amount: 50, type: "expense" },
      { _id: "2", description: "Salary", amount: 1000, type: "income" },
    ];
    transactionsService.getTransactions.mockResolvedValueOnce(mockTransactions);

    await store.dispatch("transactions/fetchTransactions");

    // Verify that the status eventually becomes "success" after the action completes
    expect(store.state.transactions.status).toBe("success");

    // Verify transactionsService.setAuthToken was called with the correct token
    expect(transactionsService.setAuthToken).toHaveBeenCalledWith(mockToken);

    // Verify transactionsService.getTransactions was called
    expect(transactionsService.getTransactions).toHaveBeenCalled();

    // Verify transactions_success mutation was committed with the correct data
    expect(store.state.transactions.transactions).toEqual(mockTransactions);
  });

  it("fetchTransactions action commits transactions_error on API call failure", async () => {
    const errorMessage = "Failed to fetch transactions";
    transactionsService.getTransactions.mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    await expect(store.dispatch("transactions/fetchTransactions")).rejects.toBe(
      errorMessage
    );

    // Verify that the status eventually becomes "error" after the action completes
    expect(store.state.transactions.status).toBe("error");

    // Verify transactionsService.setAuthToken was called with the correct token
    expect(transactionsService.setAuthToken).toHaveBeenCalledWith(mockToken);

    // Verify transactionsService.getTransactions was called
    expect(transactionsService.getTransactions).toHaveBeenCalled();

    // Verify transactions_error mutation was committed with the correct error message
    expect(store.state.transactions.error).toBe(errorMessage);
  });

  it("addTransaction action commits add_transaction_success on successful API call", async () => {
    const newTransaction = {
      description: "Coffee",
      amount: 5,
      type: "expense",
    };
    const returnedTransaction = { _id: "3", ...newTransaction };
    transactionsService.addTransaction.mockResolvedValueOnce(
      returnedTransaction
    );

    await store.dispatch("transactions/addTransaction", newTransaction);

    expect(transactionsService.setAuthToken).toHaveBeenCalledWith(mockToken);
    expect(transactionsService.addTransaction).toHaveBeenCalledWith(
      newTransaction
    );
    expect(store.state.transactions.transactions).toContainEqual(
      returnedTransaction
    );
    expect(store.state.transactions.status).toBe("success");
  });
});
