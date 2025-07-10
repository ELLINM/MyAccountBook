// client/tests/unit/authService.spec.js
import AuthService from "@/services/authService"; // This will import the actual AuthService
import axios from "axios"; // This will import the mocked axios

// Declare mockApiInstance. It will be assigned the mocked axios instance.
let mockApiInstance;

// Mock the axios library. This mock is hoisted.
jest.mock("axios", () => {
  // We're returning a structure that mimics the real axios,
  // but with jest.fn() for methods and a mock for create().
  const mockAxiosInstance = {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(), // Add other methods if used by your services
    delete: jest.fn(), // Add other methods if used by your services
  };

  return {
    // When axios.create() is called in authService.js, it will return this specific instance.
    create: jest.fn(() => mockAxiosInstance),
    defaults: {
      headers: {
        common: {},
      },
    },
    // Also include the mockAxiosInstance methods at the top level
    // in case AuthService directly calls axios.post etc., or accesses axios.defaults.
    ...mockAxiosInstance,
  };
});

describe("AuthService", () => {
  // beforeAll runs once before all tests in this describe block.
  beforeAll(() => {
    // The axios.create() mock has already been set up by jest.mock.
    // When AuthService is imported, it calls axios.create().
    // We can get a reference to the mock instance returned by axios.create()
    // by calling it directly on the mocked axios here.
    mockApiInstance = axios.create();
  });

  // beforeEach runs before each individual test.
  beforeEach(() => {
    // Clear all mocks on the entire Jest mock system
    jest.clearAllMocks();

    // Explicitly clear mock calls on mockApiInstance's methods for each test.
    // This ensures tests are isolated and don't carry over mock data.
    mockApiInstance.post.mockClear();
    mockApiInstance.get.mockClear();
    mockApiInstance.put.mockClear();
    mockApiInstance.delete.mockClear();

    // Reset global axios headers for each test.
    axios.defaults.headers.common = {};
  });

  // --- login method tests ---
  it("login method should send a POST request to /auth/login and return data on success", async () => {
    const mockCredentials = {
      email: "test@example.com",
      password: "password123",
    };
    const mockToken = "mock-jwt-token";
    const mockUser = { id: "1", email: "test@example.com" };
    const mockResponseData = { token: mockToken, user: mockUser };

    // Set the mock behavior for the post method on our captured mockApiInstance
    mockApiInstance.post.mockResolvedValueOnce({ data: mockResponseData });

    const result = await AuthService.login(mockCredentials);

    // Assert that the post method was called on the mock instance
    expect(mockApiInstance.post).toHaveBeenCalledWith(
      "/login",
      mockCredentials
    );
    // Assert that the global axios defaults header was set
    expect(axios.defaults.headers.common["x-auth-token"]).toBe(mockToken);
    // Assert the returned result
    expect(result).toEqual({ token: mockToken, user: mockUser });
  });

  it("login method should throw an error on API call failure", async () => {
    const mockCredentials = {
      email: "test@example.com",
      password: "wrongpassword",
    };
    const errorMessage = "Invalid credentials";
    // *** IMPORTANT FIX: Mock the error object exactly as Axios would return it
    // and as authService.js expects to access it.
    const mockError = { response: { data: { message: errorMessage } } };

    mockApiInstance.post.mockRejectedValueOnce(mockError);

    // Expect the promise to reject and throw the specific error message
    // Note: AuthService.login directly re-throws the Axios error.
    // So, we expect the received error's message property to be errorMessage.
    await expect(AuthService.login(mockCredentials)).rejects.toHaveProperty(
      "response.data.message",
      errorMessage // We now expect the nested property
    );

    expect(mockApiInstance.post).toHaveBeenCalledWith(
      "/login",
      mockCredentials
    );
    // Assert that the token was not set or cleared due to failure
    expect(axios.defaults.headers.common["x-auth-token"]).toBeUndefined();
  });

  // --- register method tests ---
  it("register method should send a POST request to /auth/register and return data on success", async () => {
    const mockUserData = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    };
    const mockResponseData = { message: "User registered successfully" };

    mockApiInstance.post.mockResolvedValueOnce({ data: mockResponseData });

    const result = await AuthService.register(mockUserData);

    expect(mockApiInstance.post).toHaveBeenCalledWith(
      "/register",
      mockUserData
    );
    expect(result).toEqual(mockResponseData);
  });

  it("register method should throw an error on API call failure", async () => {
    const mockUserData = {
      username: "existinguser",
      email: "test@example.com",
      password: "password123",
    };
    const errorMessage = "User already exists";
    // *** IMPORTANT FIX: Mock the error object exactly as Axios would return it
    // and as authService.js expects to access it.
    const mockError = { response: { data: { message: errorMessage } } };

    mockApiInstance.post.mockRejectedValueOnce(mockError);

    // We expect the received error's message property to be errorMessage.
    await expect(AuthService.register(mockUserData)).rejects.toHaveProperty(
      "response.data.message",
      errorMessage // We now expect the nested property
    );
    expect(mockApiInstance.post).toHaveBeenCalledWith(
      "/register",
      mockUserData
    );
  });

  // --- logout method tests ---
  it("logout method should clear auth token from headers", async () => {
    // Pre-set a token to ensure it gets cleared
    axios.defaults.headers.common["x-auth-token"] = "some-old-token";

    await AuthService.logout();

    // The logout method in authService.js just clears the token, no API call
    expect(mockApiInstance.post).not.toHaveBeenCalled();
    expect(axios.defaults.headers.common["x-auth-token"]).toBeUndefined();
  });

  // --- setAuthToken method tests ---
  it("setAuthToken should set x-auth-token header correctly when a token is provided", () => {
    const token = "new-mock-jwt-token";
    AuthService.setAuthToken(token);
    expect(axios.defaults.headers.common["x-auth-token"]).toBe(token);
  });

  it("setAuthToken should clear x-auth-token header if token is null", () => {
    axios.defaults.headers.common["x-auth-token"] = "existing-token";
    AuthService.setAuthToken(null);
    expect(axios.defaults.headers.common["x-auth-token"]).toBeUndefined();
  });

  it("setAuthToken should clear x-auth-token header if token is an empty string", () => {
    axios.defaults.headers.common["x-auth-token"] = "existing-token";
    AuthService.setAuthToken("");
    expect(axios.defaults.headers.common["x-auth-token"]).toBeUndefined();
  });
});
