import { includeIgnoreFile } from "@eslint/compat";
import { defineConfig } from "eslint/config";

import globals from "globals";
import js from "@eslint/js";

import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  includeIgnoreFile(import.meta.dirname + "/.gitignore"),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      ecmaVersion: "latest",
      sourceType: "module",
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
