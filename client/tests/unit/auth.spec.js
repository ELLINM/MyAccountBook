// client/tests/unit/auth.spec.js
import authModule from "@/store/modules/auth";
import AuthService from "@/services/authService";

// Mock AuthService dependency
jest.mock("@/services/authService", () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  setAuthToken: jest.fn(),
}));

// Mock localStorage for the entire test suite
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: jest.fn((key) => {
      // localStorage returns null for non-existent keys
      return store[key] === undefined ? null : store[key];
    }),
    setItem: jest.fn((key, value) => {
      // Convert value to string, handling null/undefined gracefully
      store[key] = String(value);
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

describe("auth Vuex Module", () => {
  let commit;
  let originalLocalStorage; // To store original localStorage

  beforeAll(() => {
    // Store original localStorage
    originalLocalStorage = global.localStorage;
    // Replace global localStorage with mock
    Object.defineProperty(global, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  beforeEach(() => {
    // Clear all Jest mock call records.
    jest.clearAllMocks();
    // Clear mock localStorage content for each test.
    localStorageMock.clear();
    commit = jest.fn(); // Mock commit function.

    // Spy on and mock `console.error` calls to suppress them during tests.
    // This is important because `safelyParseJSON` uses `console.error`.
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Crucially, clear the module cache before each test within this suite,
    // especially for tests that rely on re-initializing the authModule's state from localStorage.
    // This ensures that `require("@/store/modules/auth")` re-executes the module's top-level code.
    jest.resetModules();
  });

  afterAll(() => {
    // Restore original localStorage after all tests.
    Object.defineProperty(global, "localStorage", {
      value: originalLocalStorage,
      writable: true,
    });
    // Restore console.error.
    jest.restoreAllMocks();
  });

  // Test cases for initial state derived from localStorage using safelyParseJSON
  describe("initial state (safelyParseJSON behavior)", () => {
    it("should initialize user to null and token to null if localStorage is empty", () => {
      // Ensure localStorage returns null for both 'user' and 'token'
      localStorageMock.getItem
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null);

      // Require the module *after* setting up mocks for its initial load
      const module = require("@/store/modules/auth").default;
      expect(module.state.user).toBeNull();
      expect(module.state.token).toBeNull();
      expect(module.state.authStatus).toBe("");
      expect(module.state.error).toBeNull();
    });

    it("should initialize user to null for 'null' string from localStorage", () => {
      localStorageMock.setItem("user", "null");
      localStorageMock.getItem
        .mockReturnValueOnce("null")
        .mockReturnValueOnce(null); // Mock getItem calls for 'user' then 'token'
      const module = require("@/store/modules/auth").default;
      expect(module.state.user).toBeNull();
      expect(module.state.token).toBeNull();
    });

    it("should initialize user to null for 'undefined' string from localStorage", () => {
      localStorageMock.setItem("user", "undefined");
      localStorageMock.getItem
        .mockReturnValueOnce("undefined")
        .mockReturnValueOnce(null);
      const module = require("@/store/modules/auth").default;
      expect(module.state.user).toBeNull();
      expect(module.state.token).toBeNull();
    });

    it("should initialize user to null for empty string from localStorage", () => {
      localStorageMock.setItem("user", "");
      localStorageMock.getItem
        .mockReturnValueOnce("")
        .mockReturnValueOnce(null);
      const module = require("@/store/modules/auth").default;
      expect(module.state.user).toBeNull();
      expect(module.state.token).toBeNull();
    });

    it("should parse valid JSON user and token from localStorage", () => {
      const mockUser = { name: "Logged In User" };
      const mockToken = "valid-jwt-token";
      localStorageMock.setItem("user", JSON.stringify(mockUser));
      localStorageMock.setItem("token", mockToken);

      // We need to re-mock getItem for its specific sequence during module load
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "user") return JSON.stringify(mockUser);
        if (key === "token") return mockToken;
        return null;
      });

      const module = require("@/store/modules/auth").default;
      expect(module.state.user).toEqual(mockUser);
      expect(module.state.token).toBe(mockToken);
    });

    it("should initialize user to null and log error for invalid JSON user in localStorage", () => {
      const invalidJson = "{invalid json";
      localStorageMock.setItem("user", invalidJson);
      localStorageMock.getItem
        .mockReturnValueOnce(invalidJson)
        .mockReturnValueOnce(null); // Mock for 'user' then 'token'

      const module = require("@/store/modules/auth").default;
      expect(module.state.user).toBeNull();
      // Expect console.error to have been called because safelyParseJSON will catch the parse error
      expect(console.error).toHaveBeenCalledWith(
        "Error parsing JSON from localStorage:",
        expect.any(SyntaxError), // Check for any SyntaxError
        "String:",
        invalidJson
      );
    });
  });

  // --- Getters tests ---
  describe("getters", () => {
    // A fresh, uninitialized state for getters and mutations tests
    let localState;
    beforeEach(() => {
      localState = {
        user: null,
        token: null,
        authStatus: "",
        error: null,
      };
    });

    it("isAuthenticated returns true if token exists", () => {
      localState.token = "some_token";
      expect(authModule.getters.isAuthenticated(localState)).toBe(true);
    });

    it("isAuthenticated returns false if token is null", () => {
      localState.token = null;
      expect(authModule.getters.isAuthenticated(localState)).toBe(false);
    });

    it("authStatus returns the current auth status", () => {
      localState.authStatus = "loading";
      expect(authModule.getters.authStatus(localState)).toBe("loading");
    });

    it("currentUser returns the current user object", () => {
      const user = { name: "Test User" };
      localState.user = user;
      expect(authModule.getters.currentUser(localState)).toEqual(user);
    });

    it("authError returns the current error message", () => {
      localState.error = "Login failed";
      expect(authModule.getters.authError(localState)).toBe("Login failed");
    });

    it("getToken returns the current token", () => {
      localState.token = "some_token";
      expect(authModule.getters.getToken(localState)).toBe("some_token");
    });
  });

  // --- Mutations tests ---
  describe("mutations", () => {
    // A fresh, uninitialized state for getters and mutations tests
    let localState;
    beforeEach(() => {
      localState = {
        user: null,
        token: null,
        authStatus: "",
        error: null,
      };
    });

    it("auth_request sets authStatus to loading and clears error", () => {
      localState.authStatus = "idle";
      localState.error = "previous error";
      authModule.mutations.auth_request(localState);
      expect(localState.authStatus).toBe("loading");
      expect(localState.error).toBeNull();
    });

    it("auth_success sets authStatus to success, updates token and user, clears error", () => {
      const payload = { token: "new_token", user: { id: 1, name: "New User" } };
      authModule.mutations.auth_success(localState, payload);
      expect(localState.authStatus).toBe("success");
      expect(localState.token).toBe("new_token");
      expect(localState.user).toEqual({ id: 1, name: "New User" });
      expect(localState.error).toBeNull();
    });

    it("register_success sets authStatus to register_success and clears error", () => {
      localState.authStatus = "loading";
      localState.error = "previous error";
      authModule.mutations.register_success(localState);
      expect(localState.authStatus).toBe("register_success");
      expect(localState.error).toBeNull();
    });

    it("auth_error sets authStatus to error, clears token and user, sets error message", () => {
      const errorMessage = "Login failed";
      localState.token = "old_token";
      localState.user = { id: 1, name: "Old User" };
      authModule.mutations.auth_error(localState, errorMessage);
      expect(localState.authStatus).toBe("error");
      expect(localState.token).toBeNull();
      expect(localState.user).toBeNull();
      expect(localState.error).toBe(errorMessage);
    });

    it("logout clears authStatus, token, user, and error", () => {
      localState.authStatus = "success";
      localState.token = "some_token";
      localState.user = { id: 1, name: "User" };
      localState.error = "some error";
      authModule.mutations.logout(localState);
      expect(localState.authStatus).toBe("");
      expect(localState.token).toBeNull();
      expect(localState.user).toBeNull();
      expect(localState.error).toBeNull();
    });
  });

  // --- Actions tests ---
  describe("actions", () => {
    // login action tests
    it("login commits auth_success and sets localStorage on successful login", async () => {
      const credentials = { email: "test@example.com", password: "password" };
      const mockResponse = {
        token: "mock-jwt-token",
        user: { id: 1, name: "Test User" },
      };
      AuthService.login.mockResolvedValueOnce(mockResponse);

      await authModule.actions.login({ commit }, credentials);

      expect(commit).toHaveBeenCalledWith("auth_request");
      expect(AuthService.login).toHaveBeenCalledWith(credentials);
      expect(AuthService.setAuthToken).toHaveBeenCalledWith(mockResponse.token);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "token",
        mockResponse.token
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify(mockResponse.user)
      );
      expect(commit).toHaveBeenCalledWith("auth_success", mockResponse);
      expect(commit).toHaveBeenCalledTimes(2); // auth_request, auth_success
      expect(AuthService.setAuthToken).toHaveBeenCalledTimes(1);
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
    });

    it("login commits auth_error and clears localStorage on failed login (with response message)", async () => {
      const credentials = {
        email: "test@example.com",
        password: "wrong_password",
      };
      const errorMessage = "Invalid credentials";
      const mockError = { response: { data: { message: errorMessage } } };
      AuthService.login.mockRejectedValueOnce(mockError);

      await expect(
        authModule.actions.login({ commit }, credentials)
      ).rejects.toBe(errorMessage);

      expect(commit).toHaveBeenCalledWith("auth_request");
      expect(AuthService.login).toHaveBeenCalledWith(credentials);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user");
      expect(commit).toHaveBeenCalledWith("auth_error", errorMessage);
      expect(commit).toHaveBeenCalledTimes(2); // auth_request, auth_error
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(2);
    });

    it("login commits auth_error and clears localStorage on failed login (generic message)", async () => {
      const credentials = {
        email: "test@example.com",
        password: "wrong_password",
      };
      const mockError = new Error("Network error"); // Simulate a network error without response.data
      AuthService.login.mockRejectedValueOnce(mockError);

      await expect(
        authModule.actions.login({ commit }, credentials)
      ).rejects.toBe("Login failed");

      expect(commit).toHaveBeenCalledWith("auth_request");
      expect(AuthService.login).toHaveBeenCalledWith(credentials);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user");
      expect(commit).toHaveBeenCalledWith("auth_error", "Login failed");
      expect(commit).toHaveBeenCalledTimes(2); // auth_request, auth_error
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(2);
    });

    // register action tests
    it("register commits register_success on successful registration", async () => {
      const credentials = {
        name: "New User",
        email: "new@example.com",
        password: "password",
      };
      AuthService.register.mockResolvedValueOnce({});

      await authModule.actions.register({ commit }, credentials);

      expect(commit).toHaveBeenCalledWith("auth_request");
      expect(AuthService.register).toHaveBeenCalledWith(credentials);
      expect(commit).toHaveBeenCalledWith("register_success");
      expect(commit).toHaveBeenCalledTimes(2); // auth_request, register_success
    });

    it("register commits auth_error on failed registration (with response message)", async () => {
      const credentials = {
        name: "New User",
        email: "existing@example.com",
        password: "password",
      };
      const errorMessage = "User already exists";
      const mockError = { response: { data: { message: errorMessage } } };
      AuthService.register.mockRejectedValueOnce(mockError);

      await expect(
        authModule.actions.register({ commit }, credentials)
      ).rejects.toBe(errorMessage);

      expect(commit).toHaveBeenCalledWith("auth_request");
      expect(AuthService.register).toHaveBeenCalledWith(credentials);
      expect(commit).toHaveBeenCalledWith("auth_error", errorMessage);
      expect(commit).toHaveBeenCalledTimes(2); // auth_request, auth_error
    });

    it("register commits auth_error on failed registration (generic message)", async () => {
      const credentials = {
        name: "New User",
        email: "existing@example.com",
        password: "password",
      };
      const mockError = new Error("Network error during registration");
      AuthService.register.mockRejectedValueOnce(mockError);

      await expect(
        authModule.actions.register({ commit }, credentials)
      ).rejects.toBe("Registration failed");

      expect(commit).toHaveBeenCalledWith("auth_request");
      expect(AuthService.register).toHaveBeenCalledWith(credentials);
      expect(commit).toHaveBeenCalledWith("auth_error", "Registration failed");
      expect(commit).toHaveBeenCalledTimes(2); // auth_request, auth_error
    });

    // logout action tests
    it("logout commits logout and clears localStorage", async () => {
      AuthService.logout.mockResolvedValueOnce({});

      await authModule.actions.logout({ commit });

      expect(AuthService.logout).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith("logout");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user");
      expect(commit).toHaveBeenCalledTimes(1); // Only logout mutation
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(2);
    });
  });
});
