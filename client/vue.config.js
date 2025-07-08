// vue.config.js
const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  publicPath: "/",
  outputDir: "dist",
  assetsDir: "",
  filenameHashing: true,
  productionSourceMap: true,
  transpileDependencies: true,
  css: {
    loaderOptions: {
      /* ... */
    },
  },
  devServer: {
    host: "0.0.0.0",
    port: 8080,
    open: true,
    // --- Start of Added Proxy Configuration ---
    proxy: {
      "/api": {
        // Proxy requests starting with '/api'
        target: "http://localhost:5000", // Target backend server
        changeOrigin: true, // Change the origin of the host header to the target URL
        ws: true, // Enable WebSocket proxying (if your backend uses WebSockets)
        //pathRewrite: { "^/api": "" }, // Optional: If your backend routes don't include '/api'
      },
    },
    // --- End of Added Proxy Configuration ---
  },
  chainWebpack: (config) => {
    if (config.module.rules.has("eslint")) {
      config.module
        .rule("eslint")
        .use("eslint-loader")
        .tap((options) => {
          options.fix = true;
          return options;
        });
    }
  },
});
