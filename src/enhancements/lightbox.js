import { buildAndSend } from "../utils/google-analytics.js";

export default function lightbox() {
  return {
    state: "initial",

    init() {
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
