const purgecss = require("@fullhuman/postcss-purgecss")({
  content: ["./hugo_stats.json"],
  defaultExtractor: (content) => {
    let els = JSON.parse(content).htmlElements;
    return els.tags.concat(els.classes, els.ids);
  },
  whitelistPatternsChildren: [
    // Don't purge attributes
    /disabled|multiple|readonly|rows|type|x-cloak/,
  ],
});

module.exports = {
  plugins: [
    require("tailwindcss"),
    require("autoprefixer"),
    ...(process.env.HUGO_ENVIRONMENT !== "development" ? [purgecss] : []),
  ],
};
