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
        plugins: [pluginGoTemplate, pluginTailwind],
      },
    },
  ],
};
