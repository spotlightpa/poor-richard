import { focus, blur } from "../utils/active-element.js";
import { modalKind } from "../utils/metrics.js";

export default function sticky() {
  return {
    isOpen: false,

    show() {
      if (modalKind !== "sticky") return;
      this.isOpen = true;
      this.$nextTick(() => focus(this.$refs.close));
    },

    close() {
      this.isOpen = false;
      this.$nextTick(() => blur(this.$refs.close));
    },
  };
}
