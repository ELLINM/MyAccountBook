// client/jest.config.js
const path = require("path");

module.exports = {
  preset: "@vue/cli-plugin-unit-jest",
  testMatch: [
    "**/tests/unit/**/*.spec.(js|jsx|ts|tsx)",
    "**/__tests__/*.(js|jsx|ts|tsx)",
  ],
  transformIgnorePatterns: ["node_modules/(?!(axios)/)"],
  moduleNameMapper: {
    "^@/(.*)$": path.resolve(__dirname, "src", "$1"),
  },
  moduleFileExtensions: ["js", "jsx", "json", "vue"],
  transform: {
    "^.+\\.vue$": "@vue/vue3-jest",
    "^.+\\.jsx?$": "babel-jest",
  },
  snapshotSerializers: ["jest-serializer-vue"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,vue}",
    "!src/main.js",
    "!src/router/index.js",
    "!src/store/index.js",
    "!**/node_modules/**",
  ],
  testEnvironment: "jsdom",
};
