import { buildAndSend } from "../utils/google-analytics.js";

// TODO: remove module
export default function lightbox() {
  return {
    state: "disabled",

    init() {
      if (
        window.matchMedia(
          "(max-width: 640px), (prefers-reduced-motion), (speech)"
        ).matches
      ) {
        this.state = "disabled";
      }
      this.$watch("state", (val) => {
        buildAndSend(this.$el, {
          eventAction: `lightbox:${val}`,
        });
      });
    },

    enter() {
      if (this.state === "initial" || this.state === "passed") {
        this.state = "active";
      }
    },

    leave() {
      if (this.state === "active" || this.state === "dismissed") {
        this.state = "passed";
      }
    },

    dismiss() {
      if (this.active) {
        this.state = "dismissed";
      }
    },

    get active() {
      return this.state === "active";
    },
  };
}
