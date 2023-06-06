export default function slider() {
  return {
    slideEls: [],
    observations: [],
    currentSlide: 0,
    loadingMode: "lazy",

    init() {
      let slides = this.$el.querySelectorAll("[data-slide-id]");
      this.slideEls = Array.from(slides);

      this.$watch("currentSlide", (i) => {
        if (i > 0) {
          this.loadingMode = "auto";
        }
        this.$view(this.slideEls[i]);
      });
    },

    center(el) {
      el.scrollIntoView({
        block: "center",
        inline: "center",
      });
    },

    get isFirst() {
      return this.currentSlide === 0;
    },

    get isLast() {
      let last = this.slideEls.length - 1;
      return this.currentSlide === last;
    },

    handleSpace(ev) {
      let direction = ev.shiftKey ? -1 : 1;
      let el = this.slideEls[this.currentSlide + direction];
      if (!el) {
        document.activeElement.blur();
        return;
      }
      this.center(el);
    },
  };
}
