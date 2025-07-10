<template>
  <div class="auth-container">
    <h2>{{ activeTab === "login" ? "Login" : "Register" }}</h2>
    <div class="tabs">
      <button
        :class="{ active: activeTab === 'login' }"
        @click="activeTab = 'login'"
        class="login-tab-button"
      >
        Login
      </button>
      <button
        :class="{ active: activeTab === 'register' }"
        @click="activeTab = 'register'"
        class="register-tab-button"
      >
        Register
      </button>
    </div>

    <form
      @submit.prevent="handleSubmit"
      :class="{
        'login-form': activeTab === 'login',
        'register-form': activeTab === 'register',
      }"
    >
      <div class="form-group">
        <label for="email">Email:</label>
        <input id="email" v-model="email" type="email" required />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          name="password"
        />
      </div>

      <div v-if="activeTab === 'register'" class="form-group">
        <label for="passwordConfirm">Confirm Password:</label>
        <input
          id="passwordConfirm"
          v-model="passwordConfirm"
          type="password"
          required
          name="passwordConfirm"
        />
      </div>

      <p v-if="authStatus === 'loading'" class="loading-message">
        Processing request...
      </p>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

      <button type="submit" :disabled="authStatus === 'loading'">
        {{ activeTab === "login" ? "Login" : "Register" }}
      </button>
    </form>
  </div>
</template>

<script>
  import { mapActions, mapGetters } from "vuex";

  export default {
    name: "LoginRegister",
    data() {
      return {
        activeTab: "login",
        email: "",
        password: "",
        passwordConfirm: "",
        errorMessage: "",
        successMessage: "",
      };
    },
    computed: {
      ...mapGetters("auth", ["authStatus", "isAuthenticated"]),
    },
    watch: {
      // Combine relevant watchers for better control and sequence
      authStatus: {
        immediate: true, // Run immediately on component creation
        async handler(newStatus, oldStatus) {
          // Clear messages when status changes, especially to loading
          if (newStatus === "loading") {
            this.errorMessage = "";
            this.successMessage = "";
            return; // Exit early if loading, wait for next status
          }

          // Handle success after login
          if (newStatus === "success" && this.isAuthenticated) {
            this.errorMessage = "";
            this.successMessage = "";
            // Ensure router push happens after all state updates
            if (this.$route.path === "/auth") {
              // Only redirect from /auth
              this.$router.push("/dashboard");
            }
            return;
          }

          // Handle successful registration
          if (newStatus === "register_success") {
            this.errorMessage = "";
            this.successMessage = "Registration successful! Please log in.";
            this.activeTab = "login";
            return;
          }

          // Handle error status (assuming authStatus can become 'error')
          // You might want to set errorMessage here based on a Vuex error state
          // if (newStatus === "error" && this.$store.getters['auth/authError']) {
          //   this.errorMessage = this.$store.getters['auth/authError'];
          // }
        },
      },
      // Keep isAuthenticated separate if it can change independently of authStatus
      // However, if isAuthenticated is directly tied to authStatus, consider merging.
      // Given the current setup, it seems fine to keep it separate.
      isAuthenticated: {
        immediate: true, // Important for initial check
        handler(newValue, oldValue) {
          if (newValue && this.$route.path === "/auth") {
            this.$router.push("/dashboard");
          }
        },
      },
      activeTab() {
        // Always clear fields and messages when tabs switch
        this.errorMessage = "";
        this.successMessage = "";
        this.email = "";
        this.password = "";
        this.passwordConfirm = "";
      },
    },
    created() {
      // The immediate: true on isAuthenticated watcher handles this now
      // No explicit router push needed here if watcher is immediate
      // if (this.isAuthenticated) {
      //   this.$router.push("/dashboard");
      // }
    },
    methods: {
      ...mapActions("auth", ["login", "register"]),
      async handleSubmit() {
        // Messages are cleared by watcher on 'loading' status, but also here for immediate feedback
        this.errorMessage = "";
        this.successMessage = "";
        try {
          if (this.activeTab === "login") {
            await this.login({
              email: this.email,
              password: this.password,
            });
          } else {
            // Register tab
            if (this.password !== this.passwordConfirm) {
              this.errorMessage = "Passwords do not match.";
              return;
            }
            await this.register({
              email: this.email,
              password: this.password,
            });
          }
        } catch (error) {
          // Make sure authStatus is set to 'error' or 'idle' in your Vuex action on error
          this.errorMessage =
            error.response && error.response.data && error.response.data.message
              ? error.response.data.message
              : "An unexpected error occurred.";
          this.successMessage = ""; // Clear success message on error
        }
      },
    },
  };
</script>

<style scoped>
  .auth-container {
    max-width: 400px;
    margin: 50px auto;
    padding: 30px;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    text-align: center;
  }

  h2 {
    color: #333;
    margin-bottom: 25px;
  }

  .tabs {
    margin-bottom: 25px;
    display: flex;
    justify-content: center;
    gap: 10px;
  }

  .tabs button {
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    padding: 10px 20px;
    margin: 0;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition:
      background-color 0.3s ease,
      color 0.3s ease,
      border-color 0.3s ease;
    flex-grow: 1;
    max-width: 150px;
  }

  .tabs button.active {
    background-color: #42b983;
    color: white;
    border-color: #42b983;
  }

  .tabs button:hover:not(.active) {
    background-color: #e0e0e0;
  }

  .form-group {
    margin-bottom: 18px;
    text-align: left;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #555;
  }

  .form-group input {
    width: calc(100% - 20px);
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
    box-sizing: border-box;
  }

  button[type="submit"] {
    width: 100%;
    padding: 12px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 20px;
  }

  button[type="submit"]:hover:not(:disabled) {
    background-color: #0056b3;
  }

  button[type="submit"]:disabled {
    background-color: #a0d4b8;
    cursor: not-allowed;
  }

  .error-message {
    color: #dc3545;
    margin-top: 15px;
    font-size: 14px;
  }

  .loading-message {
    color: #007bff;
    margin-top: 15px;
    font-size: 14px;
  }
</style>
