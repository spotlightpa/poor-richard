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
        "**/featured/*.html",
        "**/news/featured.html",
        "**/news/single.html",
        "**/sc/*.html",
        "**/statecollege/*.html",
        "**/tw/*.html",
      ],
      options: {
        plugins: [pluginGoTemplate, pluginTailwind],
      },
    },
  ],
};
