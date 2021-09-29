import { focus, blur } from "../utils/active-element.js";
import { buildAndSend } from "../utils/google-analytics.js";

export default function sticky() {
  return {
    isOpen: false,

    show() {
      if (window.matchMedia("(prefers-reduced-motion), (speech)").matches) {
        // eslint-disable-next-line no-console
        console.warn("aborting sticky display");
        return;
      }
      this.isOpen = true;
      buildAndSend(this.$el, { eventAction: "sticky:open" });
      this.$nextTick(() => focus(this.$refs.close));
    },

    close() {
      if (this.isOpen) {
        buildAndSend(this.$el, { eventAction: "sticky:close" });
      }
      this.isOpen = false;
      this.$nextTick(() => blur(this.$refs.close));
    },
  };
}
