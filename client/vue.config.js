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
  },
  chainWebpack: (config) => {
    if (config.module.rules.has("eslint")) {
      // 이 조건문이 핵심
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
