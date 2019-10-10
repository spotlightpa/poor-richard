const purgecss = require("@fullhuman/postcss-purgecss");

// eslint-disable-next-line no-unused-vars
module.exports = ctx => {
  let plugins = [require("autoprefixer")];

  if (process.env.NODE_ENV === "production") {
    plugins.push(
      purgecss({
        content: ["./**/*.html", "./**/*.vue"]
      })
    );
  }
  return { plugins };
};
