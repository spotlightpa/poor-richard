const pluginTailwind = require("prettier-plugin-tailwindcss");
const pluginGoTemplate = require("prettier-plugin-go-template");

module.exports = {
  plugins: [pluginGoTemplate],
  pluginSearchDirs: false,
  tailwindConfig: "./tailwind.config.js",
  overrides: [
    {
      files: ["*.css"],
      options: {
        plugins: [pluginTailwind],
      },
    },
    {
      files: ["*.html"],
      options: {
        parser: "go-template",
      },
    },
    {
      files: [
        "**/_default/staff-page.html",
        "**/embed/*.html",
        "**/featured/*.html",
        "**/news/featured.html",
        "**/news/single.html",
        "**/sc/*.html",
        "**/statecollege/*.html",
        "**/tw/*.html",
        "**/blocks/*.html",
        "**/shortcodes/*.html",
        "**/shortcodes/newsletters/*.html",
      ],
      options: {
        plugins: [pluginGoTemplate, pluginTailwind],
      },
    },
  ],
};
