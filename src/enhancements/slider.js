import { buildAndSend } from "../utils/google-analytics.js";

export default function slider() {
  return {
    slideEls: [],
    observations: [],
    currentSlide: 0,
    loadingMode: "lazy",

    init() {
      if (!("IntersectionObserver" in window)) {
        return;
      }
      let ioOpts = {
        root: this.el,
        threshold: [0, 0.5],
      };

      let slides = this.$el.querySelectorAll("[data-slide-id]");
      this.slideEls = Array.from(slides);
      for (let [i, slide] of this.slideEls.entries()) {
        let o = new IntersectionObserver(([entry]) => {
          this.recordObservation(entry, i);
        }, ioOpts);
        o.observe(slide);
      }
      this.$watch("currentSlide", (i) => {
        buildAndSend(this.$el, {
          eventAction: `slider:view:${i}`,
        });
      });
    },

    recordObservation(entry, i) {
      this.observations[i] = entry;
      for (let [i, o] of this.observations.entries()) {
        let max = this.observations[this.currentSlide];
        if (o.intersectionRatio > max?.intersectionRatio) {
          this.currentSlide = i;
        }
      }
      if (entry.isIntersecting) {
        this.loadingMode = "auto";
      }
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
      buildAndSend(this.$el, {
        eventAction: `slider:space`,
      });
    },
  };
}
