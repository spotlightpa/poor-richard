import { reportView } from "../utils/google-analytics.js";
import { modalKind, recordModalTakeoverView } from "../utils/metrics.js";

export default function takeover() {
  return {
    isOpen: false,

    init() {
      this.$watch("isOpen", (val) => {
        if (val) {
          recordModalTakeoverView();
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
      if (modalKind !== "takeover") return;
      this.isOpen = true;
    },
  };
}
