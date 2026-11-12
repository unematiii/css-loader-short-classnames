const js = require("@eslint/js");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = [
  { ignores: ["index.js", "index.d.ts", "test/fixtures/**"] },
  js.configs.recommended,
  {
    files: ["src/**/*.ts", "test/types/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "no-undef": "off",
    },
  },
  {
    files: ["test/verify-integrations.js", "test/fixtures/**/*.js"],
    languageOptions: { ecmaVersion: "latest", sourceType: "commonjs" },
    rules: { "no-undef": "off" },
  },
];
