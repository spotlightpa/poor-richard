const purgecss = require("@fullhuman/postcss-purgecss")({
  content: ["./hugo_stats.json"],
  defaultExtractor: (content) => {
    let els = JSON.parse(content).htmlElements;
    return els.tags.concat(els.classes, els.ids);
  },
  safelist: {
    standard: [
      // modal bg
      "is-clipped",
    ],
    deep: [
      // Don't purge attributes
      /disabled|multiple|readonly|rows|type|x-cloak/,
    ],
    greedy: [],
  },
});

module.exports = {
  plugins: [
    require("tailwindcss"),
    require("autoprefixer"),
    ...(process.env.HUGO_ENVIRONMENT !== "development" ? [purgecss] : []),
  ],
};
