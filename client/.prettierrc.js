// .prettierrc.js
module.exports = {
  // Use single quotes for strings (false uses double quotes).
  // This was adjusted to resolve 'Replace single quotes with double quotes' errors.
  singleQuote: false,

  // Add semicolons at the end of statements.
  // Adjusted to resolve 'Insert semicolon' errors.
  semi: true,

  // Add trailing commas in ES5-compatible way (objects, arrays, function calls).
  // Helps maintain consistency with ESLint rules.
  trailingComma: "es5",

  // Specify the number of spaces per indentation-level.
  // This helps resolve 'Insert `··`' (indentation) errors.
  tabWidth: 2,

  // Specify the line length that the printer will wrap on.
  // Adjust this value if you encounter 'Replace line break' or 'Insert `⏎`' errors due to line length.
  // Common values are 80, 100, or 120.
  printWidth: 80,

  // Include parentheses around a sole arrow function parameter.
  // 'always' (x) => x, 'avoid' x => x
  arrowParens: "always",

  // Indent script and style tags in Vue files.
  vueIndentScriptAndStyle: true,
  singleAttributePerLine: false,
};
