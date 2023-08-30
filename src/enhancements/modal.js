import {
  modalKind,
  recordModalNewsletterView,
  recordNewsletterSignup,
} from "../utils/metrics.js";

export default function modal() {
  return {
    isOpen: false,

    init() {
      this.$watch("isOpen", (val) => {
        if (val) {
          recordModalNewsletterView();
        }
      });
    },

    show() {
      if (modalKind !== "newsletter") return;
      this.isOpen = true;
    },

    seenIt() {
      recordNewsletterSignup();
      this.isOpen = false;
    },
  };
}
