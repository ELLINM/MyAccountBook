// client/src/store/modules/auth.js
const state = {
  user: null, // Authenticated user data
  token: localStorage.getItem("token") || null, // JWT token from localStorage
  authStatus: "", // 'loading', 'success', 'error'
};

const getters = {
  isAuthenticated: (state) => !!state.token, // True if token exists
  authState: (state) => state.authStatus,
  currentUser: (state) => state.user,
};

const actions = {
  // Action for user login
  async login({ commit }, userCredentials) {
    commit("auth_request"); // Set auth status to loading
    try {
      // In a real app, you'd make an API call here
      // const response = await axios.post('/api/auth/login', userCredentials);
      // const token = response.data.token;
      // const user = response.data.user;

      // Mock data for now
      const token = "mock-jwt-token-12345";
      const user = { email: userCredentials.email, id: "mock-user-id" };

      localStorage.setItem("token", token); // Store token in localStorage
      commit("auth_success", { token, user }); // Commit success mutation
    } catch (error) {
      commit("auth_error"); // Commit error mutation
      // You might want to dispatch a global error message action here
    }
  },
  // Action for user registration
  async register({ commit }, _userDetails) {
    commit("auth_request");
    try {
      // In a real app, you'd make an API call here
      // const response = await axios.post('/api/auth/register', _userDetails);
      commit("register_success"); // Commit success mutation
    } catch (error) {
      commit("auth_error"); // Commit error mutation
    }
  },
  // Action for user logout
  async logout({ commit }) {
    await localStorage.removeItem("token"); // Remove token from localStorage
    commit("logout"); // Commit logout mutation
  },
};

const mutations = {
  auth_request(state) {
    state.authStatus = "loading"; // Set status to loading
  },
  auth_success(state, { token, user }) {
    state.authStatus = "success";
    state.token = token;
    state.user = user;
  },
  auth_error(state) {
    state.authStatus = "error";
    state.token = null;
    state.user = null;
  },
  register_success(state) {
    state.authStatus = "success"; // Registration is just a success status
  },
  logout(state) {
    state.authStatus = "";
    state.token = null;
    state.user = null;
  },
};

export default {
  namespaced: true, // Namespacing helps prevent module naming collisions
  state,
  getters,
  actions,
  mutations,
};
