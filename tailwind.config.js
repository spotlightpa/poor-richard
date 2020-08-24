module.exports = {
  purge: false,
  theme: {
    fontFamily: {
      serif: "Merriweather, serif",
      sans:
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", ' +
        'Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", ' +
        '"Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif',
    },
    fontSize: {
      xs: "0.7rem",
      sm: "0.8rem",
      base: "1rem",
      lg: "1.3rem",
      xl: "1.4rem",
      "2xl": "1.5rem",
      "3xl": "2rem",
      "4xl": "2.4rem",
      "5xl": "3rem",
      "6xl": "3.4em",
    },
    extend: {
      lineHeight: {
        normal: "1.6",
        hed: "1.15",
      },
      colors: {
        yellow: "#ffcb05",
        darkblue: "#22416e",
        caption: "#5d5d5d",
      },
      spacing: {
        "16x9": `${(100 * 9) / 16}%`,
        "6x4": `${(100 * 4) / 6}%`,
      },
      screens: {
        md: "850px",
        lg: "1080px",
      },
      maxWidth: {
        content: "730px",
      },
    },
  },
  variants: {},
  plugins: [],
  future: {
    removeDeprecatedGapUtilities: true,
  },
};
