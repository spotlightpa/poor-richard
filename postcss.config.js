const purgecss = require("@fullhuman/postcss-purgecss");

module.exports = ctx => {
  let plugins = [require("autoprefixer")];

  if (process.env.NODE_ENV === "production") {
    plugins.push(
      purgecss({
        content: ["./**/*.html"]
      })
    );
  }
  return { plugins };
};
