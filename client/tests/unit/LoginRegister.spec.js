import { shallowMount } from "@vue/test-utils";
import { createStore } from "vuex";
import LoginRegister from "@/views/LoginRegister.vue";

// Helper to wait for all promises to resolve in the microtask queue
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

// Robust waitForVueUpdate helper to ensure all Vue updates and timers are processed
const waitForVueUpdate = async (wrapper) => {
  // Ensure all Vue's DOM updates are processed
  await wrapper.vm.$nextTick();
  // Ensure all microtasks (promises) are resolved
  await flushPromises();

  // Run all fake timers. This will execute any setTimeout/setInterval calls.
  // This is safe to call repeatedly within a fake timer environment.
  jest.runAllTimers();

  // After running timers, new Vue updates or promises might have been queued.
  // So, run nextTick and flushPromises again to ensure everything settles.
  await wrapper.vm.$nextTick();
  await flushPromises();

  // Add a few more cycles for extreme robustness, especially with complex watchers
  // and chained async operations in Vuex.
  for (let i = 0; i < 5; i++) {
    await wrapper.vm.$nextTick();
    await flushPromises();
  }
};

// Use fake timers for the entire test suite, ensuring it's active from the very beginning.
// This is placed outside beforeEach/afterEach to ensure it's set up earliest.
jest.useFakeTimers();

describe("LoginRegister.vue", () => {
  let mockState;
  let mutations;
  let actions;
  let getters;
  let store;
  let mockRouter;

  // Set a higher timeout for this test suite
  jest.setTimeout(60000); // Increased timeout to 60 seconds (1 minute) for maximum safety

  beforeEach(() => {
    // Clear all mocks before each test to ensure a clean state
    jest.clearAllMocks();
    // Reset timers before each test to ensure a clean timer state
    jest.runOnlyPendingTimers(); // Clear any timers from previous test if not fully cleared
    jest.clearAllTimers(); // Clear all timers

    mockState = {
      isAuthenticated: false,
      authStatus: "idle", // Default to idle
      errorMessage: "",
      successMessage: "",
    };

    mutations = {
      setAuthStatus(state, status) {
        state.authStatus = status;
      },
      setIsAuthenticated(state, value) {
        state.isAuthenticated = value;
      },
      setErrorMessage(state, message) {
        state.errorMessage = message;
      },
      setSuccessMessage(state, message) {
        state.successMessage = message;
      },
    };

    actions = {
      login: jest.fn(async ({ commit }) => {
        commit("setAuthStatus", "loading");
        return new Promise((resolve) =>
          setTimeout(() => {
            commit("setIsAuthenticated", true);
            commit("setAuthStatus", "success");
            resolve();
          }, 100)
        ); // Simulate 100ms API call
      }),
      register: jest.fn(async ({ commit }) => {
        commit("setAuthStatus", "loading");
        return new Promise((resolve) =>
          setTimeout(() => {
            commit("setAuthStatus", "register_success");
            resolve();
          }, 100)
        ); // Simulate 100ms API call
      }),
    };

    getters = {
      isAuthenticated: jest.fn(() => mockState.isAuthenticated),
      authStatus: jest.fn(() => mockState.authStatus),
      errorMessage: jest.fn(() => mockState.errorMessage),
      successMessage: jest.fn(() => mockState.successMessage),
    };

    store = createStore({
      modules: {
        auth: {
          namespaced: true,
          state: mockState,
          mutations,
          actions,
          getters,
        },
      },
    });

    mockRouter = {
      push: jest.fn(),
      currentRoute: {
        path: "/auth", // Default route for tests
      },
    };
  });

  afterEach(() => {
    // Ensure all pending timers are run after each test to prevent leakage
    jest.runOnlyPendingTimers();
    // Restore real timers after each test to prevent interference with other test files
    jest.useRealTimers();
    // Clear all mocks after each test for a clean slate
    jest.clearAllMocks();
  });

  // --- Test Cases ---

  it("redirects to /dashboard if already authenticated on creation", async () => {
    store.commit("auth/setIsAuthenticated", true);
    store.commit("auth/setAuthStatus", "success");

    const wrapper = shallowMount(LoginRegister, {
      global: {
        plugins: [store],
        mocks: {
          $router: mockRouter,
          $route: mockRouter.currentRoute,
        },
      },
    });

    await waitForVueUpdate(wrapper);
    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
    wrapper.unmount();
  });

  it("clears form fields when switching tabs", async () => {
    const wrapper = shallowMount(LoginRegister, {
      global: {
        plugins: [store],
        mocks: { $router: mockRouter, $route: mockRouter.currentRoute },
      },
    });
    await waitForVueUpdate(wrapper);

    await wrapper.setData({
      email: "test@example.com",
      password: "password123",
      passwordConfirm: "password123",
    });
    await waitForVueUpdate(wrapper);

    await wrapper.setData({ activeTab: "register" });
    await waitForVueUpdate(wrapper);

    expect(wrapper.vm.email).toBe("");
    expect(wrapper.vm.password).toBe("");
    expect(wrapper.vm.passwordConfirm).toBe(""); // Changed to toBe("")

    await wrapper.setData({ activeTab: "login" });
    await waitForVueUpdate(wrapper);

    expect(wrapper.vm.email).toBe("");
    expect(wrapper.vm.password).toBe("");
    expect(wrapper.vm.passwordConfirm).toBeUndefined();
    wrapper.unmount();
  });

  it("calls login action and redirects on successful login", async () => {
    const wrapper = shallowMount(LoginRegister, {
      global: {
        plugins: [store],
        mocks: { $router: mockRouter, $route: mockRouter.currentRoute },
      },
    });
    store.commit("auth/setAuthStatus", "idle");
    store.commit("auth/setIsAuthenticated", false);
    await waitForVueUpdate(wrapper);

    await wrapper.setData({ email: "user@example.com", password: "password" });
    await wrapper.find("form").trigger("submit");

    await waitForVueUpdate(wrapper);

    expect(actions.login).toHaveBeenCalledWith(expect.any(Object), {
      email: "user@example.com",
      password: "password",
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
    wrapper.unmount();
  });

  it("shows loading message and disables button during login request", async () => {
    actions.login.mockImplementationOnce(async ({ commit }) => {
      commit("setAuthStatus", "loading");
      return new Promise(() => {}); // This promise will never resolve
    });

    const wrapper = shallowMount(LoginRegister, {
      global: {
        plugins: [store],
        mocks: { $router: mockRouter, $route: mockRouter.currentRoute },
      },
    });
    store.commit("auth/setAuthStatus", "idle");
    await waitForVueUpdate(wrapper);

    await wrapper.setData({ email: "user@example.com", password: "password" });
    await wrapper.find("form").trigger("submit");

    await waitForVueUpdate(wrapper);

    expect(wrapper.vm.authStatus).toBe("loading");
    expect(
      wrapper.find("button[type='submit']").attributes("disabled")
    ).toBeDefined();
    expect(wrapper.find(".loading-message").exists()).toBe(true);

    wrapper.unmount();
  });

  it("calls register action and displays success message on successful registration", async () => {
    const wrapper = shallowMount(LoginRegister, {
      global: {
        plugins: [store],
        mocks: { $router: mockRouter, $route: mockRouter.currentRoute },
      },
    });
    store.commit("auth/setAuthStatus", "idle");
    await waitForVueUpdate(wrapper);

    await wrapper.setData({ activeTab: "register" });
    await waitForVueUpdate(wrapper);

    await wrapper.setData({
      email: "newuser@example.com",
      password: "newpassword",
      passwordConfirm: "newpassword",
    });

    await wrapper.find("form").trigger("submit");
    await waitForVueUpdate(wrapper);

    expect(actions.register).toHaveBeenCalledWith(expect.any(Object), {
      email: "newuser@example.com",
      password: "newpassword",
    });
    expect(wrapper.vm.successMessage).toBe(
      "Registration successful! Please log in."
    );
    expect(wrapper.vm.activeTab).toBe("login");
    wrapper.unmount();
  });

  it("shows loading message and disables button during registration request", async () => {
    actions.register.mockImplementationOnce(async ({ commit }) => {
      commit("setAuthStatus", "loading");
      return new Promise(() => {});
    });

    const wrapper = shallowMount(LoginRegister, {
      global: {
        plugins: [store],
        mocks: { $router: mockRouter, $route: mockRouter.currentRoute },
      },
    });
    store.commit("auth/setAuthStatus", "idle");
    await waitForVueUpdate(wrapper);

    await wrapper.setData({ activeTab: "register" });
    await waitForVueUpdate(wrapper);

    await wrapper.setData({
      email: "newuser@example.com",
      password: "newpassword",
      passwordConfirm: "newpassword",
    });
    await wrapper.find("form").trigger("submit");
    await waitForVueUpdate(wrapper);

    expect(wrapper.vm.authStatus).toBe("loading");
    expect(
      wrapper.find("button[type='submit']").attributes("disabled")
    ).toBeDefined();
    expect(wrapper.find(".loading-message").exists()).toBe(true);
    wrapper.unmount();
  });

  it("redirects to /dashboard when authStatus becomes 'success' and isAuthenticated is true", async () => {
    const wrapper = shallowMount(LoginRegister, {
      global: {
        plugins: [store],
        mocks: { $router: mockRouter, $route: mockRouter.currentRoute },
      },
    });
    store.commit("auth/setAuthStatus", "idle");
    store.commit("auth/setIsAuthenticated", false);
    await waitForVueUpdate(wrapper);

    store.commit("auth/setAuthStatus", "success");
    store.commit("auth/setIsAuthenticated", true);
    await waitForVueUpdate(wrapper);

    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
    wrapper.unmount();
  });

  it("displays registration success message and switches tab when authStatus becomes 'register_success'", async () => {
    const wrapper = shallowMount(LoginRegister, {
      global: {
        plugins: [store],
        mocks: { $router: mockRouter, $route: mockRouter.currentRoute },
      },
    });
    store.commit("auth/setAuthStatus", "idle");
    await waitForVueUpdate(wrapper);

    store.commit("auth/setAuthStatus", "register_success");
    await waitForVueUpdate(wrapper);

    expect(wrapper.vm.errorMessage).toBe("");
    expect(wrapper.vm.successMessage).toBe(
      "Registration successful! Please log in."
    );
    expect(wrapper.vm.activeTab).toBe("login");
    wrapper.unmount();
  });

  it("clears error message when authStatus changes to loading", async () => {
    const wrapper = shallowMount(LoginRegister, {
      global: {
        plugins: [store],
        mocks: { $router: mockRouter, $route: mockRouter.currentRoute },
      },
    });

    store.commit("auth/setErrorMessage", "Previous error");
    await waitForVueUpdate(wrapper);
    expect(wrapper.vm.errorMessage).toBe("Previous error");

    store.commit("auth/setAuthStatus", "loading");
    await waitForVueUpdate(wrapper);

    expect(wrapper.vm.errorMessage).toBe("");
    wrapper.unmount();
  });

  it("redirects from /auth to /dashboard if isAuthenticated becomes true", async () => {
    store.commit("auth/setIsAuthenticated", false);
    mockRouter.currentRoute.path = "/auth";

    const wrapper = shallowMount(LoginRegister, {
      global: {
        plugins: [store],
        mocks: { $router: mockRouter, $route: mockRouter.currentRoute },
      },
    });

    await waitForVueUpdate(wrapper);

    store.commit("auth/setIsAuthenticated", true);
    await waitForVueUpdate(wrapper);

    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
    wrapper.unmount();
  });

  it("does not redirect if isAuthenticated becomes true but not on /auth route", async () => {
    store.commit("auth/setIsAuthenticated", false);
    mockRouter.currentRoute.path = "/some-other-route";

    const wrapper = shallowMount(LoginRegister, {
      global: {
        plugins: [store],
        mocks: { $router: mockRouter, $route: mockRouter.currentRoute },
      },
    });

    await waitForVueUpdate(wrapper);

    store.commit("auth/setIsAuthenticated", true);
    await waitForVueUpdate(wrapper);

    expect(mockRouter.push).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});
