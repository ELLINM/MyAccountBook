// client/src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

// Import global styles (if any)
import "./assets/styles/main.scss"; // Will be created soon

const app = createApp(App);

app.use(router); // Use Vue Router
app.use(store); // Use Vuex Store

app.mount("#app"); // Mount the app to the #app element in index.html
