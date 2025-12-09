export default {
  tailwindConfig: "tailwind.config.js",
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
