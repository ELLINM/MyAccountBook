module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    parser: "@babel/eslint-parser",
  },
  rules: {
    "no-unused-vars": [
      "error", // 에러로 표시
      {
        argsIgnorePattern: "^_", // 인자(arguments) 중 '_'로 시작하는 것은 무시
        varsIgnorePattern: "^_", // 변수(variables) 중 '_'로 시작하는 것은 무시
        caughtErrorsIgnorePattern: "^_$", // catch 블록의 에러 변수 중 '_'로 시작하는 것은 무시
      },
    ],
  },
};
