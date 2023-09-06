import { modalKind, recordModalTakeoverView } from "../utils/metrics.js";

export default function takeover() {
  return {
    isOpen: false,

    init() {
      this.$watch("isOpen", (val) => {
        if (val) {
          recordModalTakeoverView();
        }
      });
    },

    show() {
      if (modalKind !== "takeover") return;
      this.isOpen = true;
    },
  };
}
