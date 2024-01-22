export default function carousel() {
  return {
    skip: 1,
    atBeginning: true,
    atEnd: false,
    next() {
      this.to((current, offset) => current + offset * this.skip);
    },
    prev() {
      this.to((current, offset) => current - offset * this.skip);
    },
    to(strategy) {
      let slider = this.$refs.slider;
      let current = slider.scrollLeft;
      let offset = slider.firstElementChild.getBoundingClientRect().width;
      slider.scrollTo({ left: strategy(current, offset), behavior: "smooth" });
    },
    focusableWhenVisible: {
      "x-intersect:enter"() {
        this.$el.removeAttribute("tabindex");
      },
      "x-intersect:leave"() {
        this.$el.setAttribute("tabindex", "-1");
      },
    },
    disableNextAndPreviousButtons: {
      "x-intersect:enter.threshold.05"() {
        let slideEls = this.$el.parentElement.children;

        // If this is the first slide.
        if (slideEls[0] === this.$el) {
          this.atBeginning = true;
          // If this is the last slide.
        } else if (slideEls[slideEls.length - 1] === this.$el) {
          this.atEnd = true;
        }
      },
      "x-intersect:leave.threshold.05"() {
        let slideEls = this.$el.parentElement.children;

        // If this is the first slide.
        if (slideEls[0] === this.$el) {
          this.atBeginning = false;
          // If this is the last slide.
        } else if (slideEls[slideEls.length - 1] === this.$el) {
          this.atEnd = false;
        }
      },
    },
  };
}
