const purgecss = require("@fullhuman/postcss-purgecss")({
  content: ["./hugo_stats.json"],
  extractors: [
    {
      extractor: (content) => {
        let els = JSON.parse(content).htmlElements;
        return els.tags.concat(els.classes, els.ids);
      },
      extensions: ["json"],
    },
  ],
  whitelistPatternsChildren: [
    /align|disabled|multiple|readonly|rows|type=checkbox|type=radio|type|x-cloak/,
  ],
});

let plugins = [require("autoprefixer")];
if (process.env.NODE_ENV === "production") {
  plugins.push(purgecss);
}

module.exports = {
  plugins,
};
