export default function carousel() {
  return {
    slide(direction, multiplier) {
      if (direction === "left") {
        var pixelsToLeft =
          this.$refs.carousel.childNodes[1].scrollWidth * multiplier;
        this.$refs.carousel.scrollBy({
          left: -pixelsToLeft,
          behavior: "smooth",
        });
      }
      if (direction === "right") {
        var pixelsToRight =
          this.$refs.carousel.childNodes[1].scrollWidth * multiplier;
        this.$refs.carousel.scrollBy({
          left: pixelsToRight,
          behavior: "smooth",
        });
      }
    },
  };
}
