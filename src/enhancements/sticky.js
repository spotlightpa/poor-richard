import { focus, blur } from "../utils/active-element.js";
import { modalKind } from "../utils/metrics.js";
import { reportView } from "../utils/google-analytics.js";

export default function sticky() {
  return {
    isOpen: false,

    show() {
      if (modalKind !== "sticky") return;
      this.isOpen = true;
      reportView(this.$el);
      this.$nextTick(() => focus(this.$refs.close));
    },

    close() {
      this.isOpen = false;
      this.$nextTick(() => blur(this.$refs.close));
    },
  };
}
