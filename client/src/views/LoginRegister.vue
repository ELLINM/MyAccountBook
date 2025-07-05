<template>
  <div class="auth-container">
    <h2>{{ isLogin ? "Login" : "Register" }}</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="email">Email:</label>
        <input id="email" v-model="email" type="email" required />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input id="password" v-model="password" type="password" required />
      </div>
      <div v-if="!isLogin" class="form-group">
        <label for="passwordConfirm">Confirm Password:</label>
        <input
          id="passwordConfirm"
          v-model="passwordConfirm"
          type="password"
          required
        />
      </div>

      <p v-if="authStatus === 'loading'">Processing request...</p>
      <p v-if="authError" class="error-message">{{ authError }}</p>

      <button type="submit" :disabled="authStatus === 'loading'">
        {{ isLogin ? "Login" : "Register" }}
      </button>
    </form>

    <p class="toggle-mode">
      {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
      <span @click="toggleMode">{{ isLogin ? "Register" : "Login" }}</span>
    </p>
  </div>
</template>

<script>
  import { mapActions, mapGetters } from "vuex";

  export default {
    name: "LoginRegister",
    data() {
      return {
        isLogin: true, // true for login form, false for registration form
        email: "",
        password: "",
        passwordConfirm: "",
        authError: null, // To display API error messages
      };
    },
    computed: {
      ...mapGetters("auth", ["authStatus", "isAuthenticated"]),
    },
    watch: {
      // Redirect to dashboard if authenticated
      isAuthenticated(newVal) {
        if (newVal) {
          this.$router.push("/dashboard");
        }
      },
      // Clear or set error message based on authStatus
      authStatus(newVal) {
        if (newVal === "error") {
          this.authError =
            "Login/Registration failed: Please check your email and password.";
        } else {
          this.authError = null;
        }
      },
    },
    methods: {
      ...mapActions("auth", ["login", "register"]),

      toggleMode() {
        this.isLogin = !this.isLogin;
        this.authError = null; // Clear error message on mode switch
      },

      async handleSubmit() {
        this.authError = null; // Clear error before submission

        if (this.isLogin) {
          // Handle login
          try {
            await this.login({ email: this.email, password: this.password });
            // Redirection handled by isAuthenticated watcher on success
          } catch (error) {
            this.authError = error || "An unknown error occurred during login.";
            console.error("Login failed:", error);
          }
        } else {
          // Handle registration
          if (this.password !== this.passwordConfirm) {
            this.authError = "Password and confirm password do not match.";
            return;
          }
          try {
            await this.register({ email: this.email, password: this.password });
            alert("Registration successful! Please log in.");
            this.toggleMode(); // Switch to login mode after successful registration
          } catch (error) {
            this.authError =
              error || "An unknown error occurred during registration.";
            console.error("Registration failed:", error);
          }
        }
      },
    },
  };
</script>

<style scoped>
  .auth-container {
    max-width: 400px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: #fff;
  }

  h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
  }

  .form-group {
    margin-bottom: 15px;
  }

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #555;
  }

  input[type="email"],
  input[type="password"] {
    width: calc(100% - 20px); /* Account for padding */
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button:hover:not(:disabled) {
    background-color: #0056b3;
  }

  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .toggle-mode {
    text-align: center;
    margin-top: 20px;
    color: #777;
  }

  .toggle-mode span {
    color: #007bff;
    cursor: pointer;
    font-weight: bold;
  }

  .toggle-mode span:hover {
    text-decoration: underline;
  }

  .error-message {
    color: red;
    text-align: center;
    margin-bottom: 10px;
  }
</style>
