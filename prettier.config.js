const pluginTailwind = require("prettier-plugin-tailwindcss");
const pluginGoTemplate = require("prettier-plugin-go-template");

module.exports = {
  plugins: [pluginGoTemplate],
  pluginSearchDirs: false,
  tailwindConfig: "./tailwind.config.js",
  overrides: [
    {
      files: ["*.html"],
      options: {
        parser: "go-template",
      },
    },
    {
      files: [
        "**/news/single.html",
        "**/news/featured.html",
        "**/tw/*.html",
        "**/featured/*.html",
        "**/statecollege/*.html",
      ],
      options: {
        plugins: [pluginGoTemplate, pluginTailwind],
      },
    },
  ],
};
