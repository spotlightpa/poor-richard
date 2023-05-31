import { buildAndSend } from "../utils/google-analytics.js";
import { modalKind, recordModalNewsletterView } from "../utils/metrics.js";

export default function modal() {
  return {
    isOpen: false,

    init() {
      this.$watch("isOpen", (val) => {
        if (val) {
          recordModalNewsletterView();
          buildAndSend(this.$el, {
            eventAction: "modal:newsletter:open",
            nonInteraction: true,
          });
        } else {
          this.$report({ target: this.$refs.closer });
        }
      });
    },

    get modalClass() {
      return { "is-active": this.isOpen };
    },

    show() {
      if (modalKind !== "newsletter") return;
      this.isOpen = true;
    },
  };
}
