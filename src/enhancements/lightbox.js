import { buildAndSend } from "../utils/google-analytics.js";

export default function lightbox() {
  return {
    state: "initial",
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
      this.$watch("state", (val) => {
        buildAndSend(this.$el, {
          eventAction: `lightbox:${val}`,
        });
        if (val === "active") {
          this.$dispatch("close-sticky");
        }
      });
    },

    callback(entry) {
      let showing = entry.intersectionRatio > this.intersectThreshold;
      switch (this.state) {
        case "initial":
        case "passed":
          if (showing) {
            this.state = "active";
          }
          break;
        case "active":
        case "dismissed":
          if (!showing) {
            this.state = "passed";
          }
          break;
      }
    },

    get active() {
      return this.state === "active";
    },

    dismiss() {
      if (this.active) {
        this.state = "dismissed";
      }
    },
  };
}
