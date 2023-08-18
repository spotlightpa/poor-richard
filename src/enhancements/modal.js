import { reportView } from "../utils/google-analytics.js";
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
          reportView(this.$el);
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

    seenIt() {
      recordNewsletterSignup();
      this.isOpen = false;
    },
  };
}
