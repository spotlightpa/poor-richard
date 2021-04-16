export default function slider() {
  return {
    observer: null,
    slideEls: [],
    observations: [],
    currentSlide: 0,
    loadingMode: "lazy",

    init() {
      if (!("IntersectionObserver" in window)) {
        return;
      }
      this.observer = new IntersectionObserver(
        (entries, observer) => {
          this.callback(entries, observer);
        },
        {
          root: this.el,
          threshold: [0, 0.5],
        }
      );
      let slides = this.$el.querySelectorAll("[data-slide-id]");
      this.slideEls = Array.from(slides);
      for (let slide of slides) {
        this.observer.observe(slide);
      }
    },

    callback(entries) {
      for (let e of entries) {
        let strID = e.target.dataset.slideId;
        let id = +strID;
        this.observations[id] = e;
        if (e.isIntersecting) {
          this.loadingMode = "auto";
        }
      }
      for (let [i, o] of this.observations.entries()) {
        let max = this.observations[this.currentSlide];
        if (o.intersectionRatio > max.intersectionRatio) {
          this.currentSlide = i;
        }
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
  };
}
