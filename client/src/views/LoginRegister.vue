<template>
  <div class="auth-container">
    <h2>{{ activeTab === "login" ? "Login" : "Register" }}</h2>
    <div class="tabs">
      <button
        :class="{ active: activeTab === 'login' }"
        @click="activeTab = 'login'"
      >
        Login
      </button>
      <button
        :class="{ active: activeTab === 'register' }"
        @click="activeTab = 'register'"
      >
        Register
      </button>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="email">Email:</label>
        <input id="email" v-model="email" type="email" required />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input id="password" v-model="password" type="password" required />
      </div>

      <div v-if="activeTab === 'register'" class="form-group">
        <label for="passwordConfirm">Confirm Password:</label>
        <input
          id="passwordConfirm"
          v-model="passwordConfirm"
          type="password"
          required
        />
      </div>

      <p v-if="authStatus === 'loading'" class="loading-message">
        Processing request...
      </p>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

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
      };
    },
    computed: {
      ...mapGetters("auth", ["authStatus", "isAuthenticated"]),
    },
    watch: {
      authStatus(newStatus) {
        console.log("Watcher: authStatus changed to:", newStatus); // Debug log
        if (newStatus === "success" && this.isAuthenticated) {
          this.errorMessage = "";
          console.log(
            "Watcher: Authentication successful, redirecting to /dashboard"
          ); // Debug log
          this.$router.push("/dashboard");
        } else if (newStatus === "register_success") {
          this.errorMessage = "Registration successful! Please log in.";
          this.activeTab = "login";
          console.log(
            "Watcher: Registration successful, switched to login tab."
          ); // Debug log
        }
      },
      isAuthenticated(newValue) {
        console.log("Watcher: isAuthenticated changed to:", newValue); // Debug log
        if (newValue && this.$route.path === "/auth") {
          console.log(
            "Watcher: User is authenticated, redirecting from /auth to /dashboard"
          ); // Debug log
          this.$router.push("/dashboard");
        }
      },
      activeTab(newTab) {
        console.log("Watcher: activeTab changed to:", newTab); // Debug log
        this.errorMessage = "";
        this.password = "";
        this.passwordConfirm = "";
      },
    },
    created() {
      console.log("Component created. isAuthenticated:", this.isAuthenticated); // Debug log
      if (this.isAuthenticated) {
        this.$router.push("/dashboard");
      }
    },
    methods: {
      ...mapActions("auth", ["login", "register"]),

      async handleSubmit() {
        console.log("handleSubmit called."); // Debug log
        this.errorMessage = "";

        try {
          const credentials = { email: this.email, password: this.password };
          console.log("Attempting to submit with:", credentials); // Debug log

          if (this.activeTab === "login") {
            console.log("Calling login action..."); // Debug log
            await this.login(credentials);
            console.log("Login action completed."); // Debug log
          } else {
            // activeTab === 'register'
            if (this.password !== this.passwordConfirm) {
              this.errorMessage = "Password and confirm password do not match.";
              console.log("Password mismatch error:", this.errorMessage); // Debug log
              return;
            }
            console.log("Calling register action..."); // Debug log
            await this.register(credentials);
            console.log("Register action completed."); // Debug log
          }
        } catch (error) {
          this.errorMessage =
            error.message || "An unexpected error occurred. Please try again.";
          console.error(
            "Authentication failed in handleSubmit catch block:",
            error
          ); // Debug log
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
