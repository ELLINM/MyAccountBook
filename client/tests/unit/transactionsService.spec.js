// client/tests/unit/transactionsService.spec.js
import transactionsService from "@/services/transactionsService";
import axios from "axios";

// Declare mockApiInstance. It will be assigned the mocked axios instance created by axios.create().
let mockApiInstance;

// Mock the axios library for the entire test file.
jest.mock("axios", () => {
  // This mock instance will be returned by axios.create().
  // It needs its own 'defaults' property to match transactionsService.js's usage of api.defaults.
  const mockAxiosInstance = {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    defaults: {
      // This defaults property is for the instance returned by axios.create()
      headers: {
        common: {},
      },
    },
  };

  return {
    // When axios.create() is called in transactionsService.js, it will return our mockAxiosInstance.
    create: jest.fn(() => mockAxiosInstance),
    // Also include a top-level defaults for axios, just in case it's accessed directly (though transactionsService primarily uses 'api').
    defaults: {
      headers: {
        common: {},
      },
    },
    // Spread the methods for direct axios calls if any (transactionsService uses 'api' for most, but good practice).
    ...mockAxiosInstance,
  };
});

describe("transactionsService", () => {
  // beforeAll runs once before all tests in this describe block.
  beforeAll(() => {
    // Capture the specific mock instance that axios.create() returns.
    // This ensures `mockApiInstance` refers to the same object that transactionsService uses internally.
    mockApiInstance = axios.create();
  });

  // beforeEach runs before each individual test.
  beforeEach(() => {
    // Clear all mock calls on the entire Jest mock system.
    jest.clearAllMocks();

    // Explicitly clear mock calls on mockApiInstance's methods for each test.
    mockApiInstance.post.mockClear();
    mockApiInstance.get.mockClear();
    mockApiInstance.put.mockClear();
    mockApiInstance.delete.mockClear();

    // Reset the headers on the captured mockApiInstance's defaults.
    mockApiInstance.defaults.headers.common = {};
  });

  // --- setAuthToken method tests ---
  it("setAuthToken should set x-auth-token header correctly", () => {
    const token = "test-jwt-token";
    transactionsService.setAuthToken(token);
    expect(mockApiInstance.defaults.headers.common["x-auth-token"]).toBe(token);
  });

  it("setAuthToken should clear x-auth-token header when token is null", () => {
    mockApiInstance.defaults.headers.common["x-auth-token"] = "existing-token";
    transactionsService.setAuthToken(null);
    expect(
      mockApiInstance.defaults.headers.common["x-auth-token"]
    ).toBeUndefined();
  });

  // --- getTransactions method tests ---
  it("getTransactions should fetch all transactions successfully", async () => {
    const mockTransactions = [
      { _id: "1", description: "Groceries", amount: 50 },
      { _id: "2", description: "Salary", amount: 1000 },
    ];
    mockApiInstance.get.mockResolvedValueOnce({ data: mockTransactions });

    const result = await transactionsService.getTransactions();

    expect(mockApiInstance.get).toHaveBeenCalledWith("/transactions");
    expect(result).toEqual(mockTransactions);
  });

  it("getTransactions should throw an error on API call failure", async () => {
    const errorMessage = "Failed to fetch transactions";
    const mockError = { response: { data: { message: errorMessage } } };
    mockApiInstance.get.mockRejectedValueOnce(mockError);

    await expect(transactionsService.getTransactions()).rejects.toEqual(
      mockError
    );
  });

  // --- addTransaction method tests ---
  it("addTransaction should add a new transaction successfully", async () => {
    const newTransactionData = { description: "Coffee", amount: 5 };
    const returnedTransaction = { _id: "3", ...newTransactionData };
    mockApiInstance.post.mockResolvedValueOnce({ data: returnedTransaction });

    const result = await transactionsService.addTransaction(newTransactionData);

    expect(mockApiInstance.post).toHaveBeenCalledWith(
      "/transactions",
      newTransactionData
    );
    expect(result).toEqual(returnedTransaction);
  });

  it("addTransaction should throw an error on API call failure", async () => {
    const errorMessage = "Failed to add transaction";
    const mockError = { response: { data: { message: errorMessage } } };
    mockApiInstance.post.mockRejectedValueOnce(mockError);

    await expect(transactionsService.addTransaction({})).rejects.toEqual(
      mockError
    );
  });

  // --- updateTransaction method tests ---
  it("updateTransaction should update an existing transaction successfully", async () => {
    const transactionId = "1";
    const updatedData = { description: "Updated Groceries", amount: 60 };
    const returnedUpdatedTransaction = { _id: transactionId, ...updatedData };
    mockApiInstance.put.mockResolvedValueOnce({
      data: returnedUpdatedTransaction,
    });

    const result = await transactionsService.updateTransaction(
      transactionId,
      updatedData
    );

    expect(mockApiInstance.put).toHaveBeenCalledWith(
      `/transactions/${transactionId}`,
      updatedData
    );
    expect(result).toEqual(returnedUpdatedTransaction);
  });

  it("updateTransaction should throw an error on API call failure", async () => {
    const errorMessage = "Failed to update transaction";
    const mockError = { response: { data: { message: errorMessage } } };
    mockApiInstance.put.mockRejectedValueOnce(mockError);

    await expect(
      transactionsService.updateTransaction("1", {})
    ).rejects.toEqual(mockError);
  });

  // --- deleteTransaction method tests ---
  it("deleteTransaction should delete a transaction successfully", async () => {
    const transactionId = "1";
    const successMessage = { message: "Transaction deleted" };
    mockApiInstance.delete.mockResolvedValueOnce({ data: successMessage });

    const result = await transactionsService.deleteTransaction(transactionId);

    expect(mockApiInstance.delete).toHaveBeenCalledWith(
      `/transactions/${transactionId}`
    );
    expect(result).toEqual(successMessage);
  });

  it("deleteTransaction should throw an error on API call failure", async () => {
    const errorMessage = "Failed to delete transaction";
    const mockError = { response: { data: { message: errorMessage } } };
    mockApiInstance.delete.mockRejectedValueOnce(mockError);

    await expect(transactionsService.deleteTransaction("1")).rejects.toEqual(
      mockError
    );
  });
});
