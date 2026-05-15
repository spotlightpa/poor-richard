export default {
  tailwindStylesheet: "assets/css/tw.css",
  plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-go-template"],
  overrides: [
    {
      files: ["*.html"],
      options: {
        parser: "go-template",
      },
    },
  ],
};
