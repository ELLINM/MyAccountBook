// client/jest.config.js
const path = require("path");

module.exports = {
  // Use the default Jest preset provided by Vue CLI.
  // This preset configures Jest to work with Vue components, Babel, etc.
  preset: "@vue/cli-plugin-unit-jest",

  // Define module aliases for Jest's module resolution.
  // This is crucial for resolving imports like '@/services/authService'.
  // The regular expression '^@/(.*)$' matches any path starting with '@/'
  // and captures the rest of the path.
  // '<rootDir>' is a special Jest variable that points to the project's root directory
  // (which is the 'client' folder in this case, where this jest.config.js file resides).
  // '$1' refers to the first captured group from the regex (i.e., everything after '@/').
  // Using forward slashes '/' ensures cross-platform compatibility (Windows/Linux/macOS).
  moduleNameMapper: {
    "^@/(.*)$": path.resolve(__dirname, "src", "$1"),
  },

  // Define the file extensions that Jest should look for when resolving modules.
  moduleFileExtensions: [
    "js",
    "jsx",
    "json",
    "vue", // Include .vue files for component testing
  ],

  // Define transformation rules for different file types.
  // Jest uses these transformers to compile files before running tests.
  // '^.+\\.vue$': Uses '@vue/vue3-jest' to compile Vue Single File Components (SFCs) for Vue 3.
  //               If you are using Vue 2, you should use '@vue/vue-jest' instead.
  // '^.+\\.jsx?$': Uses 'babel-jest' to compile JavaScript/JSX files, allowing use of
  //                modern JavaScript features (like ES Modules) that Jest can understand.
  transform: {
    "^.+\\.vue$": "@vue/vue3-jest", // Assuming Vue 3. If Vue 2, use '@vue/vue-jest'
    "^.+\\.jsx?$": "babel-jest",
  },

  // Define snapshot serializers. These are used to format snapshot output
  // in a human-readable way, especially for Vue components.
  snapshotSerializers: ["jest-serializer-vue"],

  // Configure code coverage collection.
  collectCoverage: true,
  // Define which files should be included in the coverage report.
  // Exclude common configuration files, router, store entry points, and node_modules.
  collectCoverageFrom: [
    "src/**/*.{js,vue}",
    "!src/main.js",
    "!src/router/index.js",
    "!src/store/index.js",
    "!**/node_modules/**",
  ],

  // Set the test environment. 'jsdom' simulates a browser environment,
  // which is typically required for testing frontend Vue components.
  testEnvironment: "jsdom",
};
