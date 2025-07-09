// client/vue.config.js

const { defineConfig } = require("@vue/cli-service");
// The 'path' module is not strictly necessary in this version
// if configureWebpack.resolve.alias is removed.
// const path = require('path');

module.exports = defineConfig({
  // Base URL for your app. If you are deploying to a sub-path, change this.
  publicPath: "/",
  // Directory where the production build files will be placed.
  outputDir: "dist",
  // Directory for static assets (js, css, img, fonts).
  assetsDir: "",
  // Whether to use filename hashing for cache busting.
  filenameHashing: true,
  // Whether to generate source maps for production build.
  productionSourceMap: true,
  // Transpile dependencies (node_modules) for older browser compatibility.
  transpileDependencies: true,

  // CSS related options.
  css: {
    loaderOptions: {
      /* You can add specific loader options here, e.g., for Sass, Less, etc. */
    },
  },

  // Development server configuration.
  devServer: {
    // Host to listen on. '0.0.0.0' makes it accessible from other devices on the network.
    host: "0.0.0.0",
    // Port for the development server.
    port: 8080,
    // Automatically open the browser when the server starts.
    open: true,

    // Proxy API requests to your backend server.
    proxy: {
      "/api": {
        // Target backend server URL.
        target: "http://localhost:5000",
        // Changes the origin of the host header to the target URL.
        changeOrigin: true,
        // Enables WebSocket proxying if your backend uses WebSockets.
        ws: true,
        // Optional: pathRewrite allows rewriting the URL path.
        // For example, if your backend endpoints don't have '/api', uncomment this.
        // pathRewrite: { "^/api": "" },
      },
    },
  },

  // Chain Webpack configuration to make fine-grained adjustments.
  chainWebpack: (config) => {
    // Example: Configure ESLint loader to automatically fix linting issues on save.
    if (config.module.rules.has("eslint")) {
      config.module
        .rule("eslint")
        .use("eslint-loader")
        .tap((options) => {
          options.fix = true; // Enable auto-fixing
          return options;
        });
    }
  },

  // Additional plugin options (e.g., for PWA, TypeScript, etc.).
  // pluginOptions: {
  //   // ...
  // }
});
