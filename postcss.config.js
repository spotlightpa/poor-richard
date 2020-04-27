const purgecss = require('@fullhuman/postcss-purgecss')({
    content: [ './hugo_stats.json' ],
    defaultExtractor: (content) => {
        let els = JSON.parse(content).htmlElements;
        return els.tags.concat(els.classes, els.ids);
    }
});

let plugins = [require("autoprefixer")];
if (process.env.NODE_ENV === "production") {
  plugins.push(purgecss);
}

module.exports = {
  plugins,
};
