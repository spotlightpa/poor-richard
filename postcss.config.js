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
      "is-sticky",
      "is-sticky logo-show-when-sticky",
      "is-sticky support-hide-when-sticky",
      "is-sticky support-show-when-sticky",
    ],
    deep: [
      /textarea/,
      // Don't purge attributes
      /disabled|multiple|readonly|type|x-cloak/,
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
