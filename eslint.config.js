const { includeIgnoreFile } = require("@eslint/compat");
const { defineConfig } = require("eslint/config");

const globals = require("globals");
const js = require("@eslint/js");

const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  includeIgnoreFile(__dirname + "/.gitignore"),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        parser: "babel-eslint",
      },
    },

    extends: compat.extends(
      "plugin:prettier/recommended",
      "eslint:recommended",
    ),

    rules: {
      "no-console": "warn",
    },
  },
]);
