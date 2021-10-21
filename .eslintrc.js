module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parser: "babel-eslint",
  },
  extends: ["plugin:prettier/recommended", "eslint:recommended"],
  rules: {
    "no-console": "warn",
  },
};
