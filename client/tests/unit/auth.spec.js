// client/tests/unit/auth.spec.js
import { createStore } from "vuex";
import authModule from "@/store/modules/auth"; // @/ points to the src directory
import AuthService from "@/services/authService";

// Mock AuthService to prevent actual API calls
jest.mock("@/services/authService", () => ({
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  setAuthToken: jest.fn(), // Mock setAuthToken as well
}));

describe("Auth Vuex Module", () => {
  let store;

  beforeEach(() => {
    // Recreate the store before each test to ensure independence
    store = createStore({
      modules: {
        auth: {
          namespaced: true,
          ...authModule, // Use actual authModule state, getters, actions, mutations
        },
      },
    });

    // Mock localStorage (to avoid affecting actual browser storage)
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => null), // Default to returning null
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    // Clear all mock calls before each test
    jest.clearAllMocks();
  });

  // --- Actions tests ---

  it("login action commits auth_success on successful login", async () => {
    const mockToken = "mock-jwt-token";
    const mockUser = { id: "1", email: "test@example.com" };
    AuthService.login.mockResolvedValueOnce({
      token: mockToken,
      user: mockUser,
    });

    // Spy on the store's commit method
    const commitSpy = jest.spyOn(store, "commit");

    await store.dispatch("auth/login", {
      email: "test@example.com",
      password: "password123",
    });

    // Verify that auth_request mutation was committed FIRST
    // Using toHaveBeenNthCalledWith to check order and payload (less strict on exact order, but checks calls)
    expect(commitSpy).toHaveBeenCalledWith(
      "auth/auth_request",
      undefined,
      undefined
    );

    // Verify auth_success mutation was committed SECOND with correct payload
    // --- START OF NEW MODIFICATION ---
    expect(commitSpy).toHaveBeenCalledWith(
      "auth/auth_success",
      {
        token: mockToken,
        user: mockUser,
      },
      undefined
    ); // Added 'undefined' here for options
    // --- END OF NEW MODIFICATION ---

    // Now, verify the final state after all mutations
    expect(store.state.auth.authStatus).toBe("success");
    expect(store.state.auth.token).toBe(mockToken);
    expect(store.state.auth.user).toEqual(mockUser);

    // Verify AuthService methods and localStorage calls
    expect(AuthService.login).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
    expect(localStorage.setItem).toHaveBeenCalledWith("token", mockToken);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "user",
      JSON.stringify(mockUser)
    );
    expect(AuthService.setAuthToken).toHaveBeenCalledWith(mockToken);

    commitSpy.mockRestore(); // Restore the spy after the test (good practice)
  });

  it("login action commits auth_error on failed login", async () => {
    const errorMessage = "Invalid credentials";
    AuthService.login.mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    const commitSpy = jest.spyOn(store, "commit"); // Add spy here as well

    await expect(
      store.dispatch("auth/login", {
        email: "wrong@example.com",
        password: "wrong",
      })
    ).rejects.toBe(errorMessage);

    // Verify mutations were called
    expect(commitSpy).toHaveBeenCalledWith(
      "auth/auth_request",
      undefined,
      undefined
    );
    // --- START OF NEW MODIFICATION ---
    expect(commitSpy).toHaveBeenCalledWith(
      "auth/auth_error",
      errorMessage,
      undefined
    ); // Added 'undefined' here for options
    // --- END OF NEW MODIFICATION ---

    // Verify final state
    expect(store.state.auth.authStatus).toBe("error");
    expect(store.state.auth.error).toBe(errorMessage);
    expect(store.state.auth.token).toBeNull();
    expect(store.state.auth.user).toBeNull();

    // Verify localStorage calls
    expect(localStorage.removeItem).toHaveBeenCalledWith("token");
    expect(localStorage.removeItem).toHaveBeenCalledWith("user");

    commitSpy.mockRestore();
  });

  it("logout action clears auth state and localStorage", async () => {
    // Set initial state to logged-in
    store.state.auth.token = "existing-token";
    store.state.auth.user = { id: "1", email: "user@example.com" };
    localStorage.getItem.mockReturnValueOnce("existing-token"); // Mock localStorage to reflect a token

    const commitSpy = jest.spyOn(store, "commit"); // Add spy here as well

    await store.dispatch("auth/logout");

    // Verify AuthService method call
    expect(AuthService.logout).toHaveBeenCalled();

    // Verify logout mutation was called
    expect(commitSpy).toHaveBeenCalledWith("auth/logout", undefined, undefined); // Check for namespace 'auth/'

    // Verify final state
    expect(store.state.auth.authStatus).toBe("");
    expect(store.state.auth.token).toBeNull();
    expect(store.state.auth.user).toBeNull();

    // Verify localStorage calls
    expect(localStorage.removeItem).toHaveBeenCalledWith("token");
    expect(localStorage.removeItem).toHaveBeenCalledWith("user");

    commitSpy.mockRestore();
  });

  // --- Getters tests ---

  it("isAuthenticated returns true if token exists", () => {
    store.state.auth.token = "some_token";
    expect(store.getters["auth/isAuthenticated"]).toBe(true);
  });

  it("isAuthenticated returns false if no token", () => {
    store.state.auth.token = null;
    expect(store.getters["auth/isAuthenticated"]).toBe(false);
  });

  it("getToken returns the current token", () => {
    const testToken = "my_test_token";
    store.state.auth.token = testToken;
    expect(store.getters["auth/getToken"]).toBe(testToken);
  });
});
