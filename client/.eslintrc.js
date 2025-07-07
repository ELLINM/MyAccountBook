// .eslintrc.js
module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/recommended", // Replaced vue3-essential with vue/recommended for more comprehensive rules.
    "@vue/prettier",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    parser: "@babel/eslint-parser",
    requireConfigFile: false, // This is the new line to fix the error.
    ecmaVersion: 2020,
    sourceType: "module",
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "prettier/prettier": ["error", {}, { usePrettierrc: true }],
    "vue/multi-word-component-names": "off",
    "vue/html-indent": "off", // Keep off
    "vue/script-indent": "off", // Keep off
  },
};
