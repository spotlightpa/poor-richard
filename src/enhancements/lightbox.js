import { buildAndSend } from "../utils/google-analytics.js";

export default function lightbox() {
  return {
    active: false,
    hasShown: false,
    intersectThreshold: 0.75,

    init() {
      if (!("IntersectionObserver" in window)) {
        return;
      }
      let ioOpts = {
        threshold: [0, 0.75, 1.0],
      };
      let o = new IntersectionObserver(([entry]) => {
        this.callback(entry);
      }, ioOpts);
      o.observe(this.$el);
      this.$watch("active", (val) => {
        if (this.hasShown && !val) {
          o.disconnect();
        }
      });
    },

    callback(entry) {
      this.active = entry.intersectionRatio > this.intersectThreshold;
      if (this.active) {
        this.hasShown = true;
      }
      let status = this.active ? "show" : "hide";
      buildAndSend(this.$el, {
        eventAction: `lightbox:toggle:${status}`,
      });
    },
  };
}
