const purgecss = require("@fullhuman/postcss-purgecss");

let plugins = [require("autoprefixer")];
if (process.env.NODE_ENV === "production") {
  plugins.push(
    purgecss({
      content: ["./**/*.html", "./**/*.vue"]
    })
  );
}

module.exports = {
  plugins
};
