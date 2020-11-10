import { focus, blur } from "../utils/active-element.js";
import { buildAndSend } from "../utils/google-analytics.js";

export default function sticky() {
  const transitionLength = 500;

  return {
    isOpen: false,

    show() {
      this.isOpen = true;
      buildAndSend(this.$el, { eventAction: "sticky:open" });
      window.setTimeout(() => focus(this.$refs.close), transitionLength);
    },

    close() {
      this.isOpen = false;
      buildAndSend(this.$el, { eventAction: "sticky:close" });
      window.setTimeout(() => blur(this.$refs.close), transitionLength);
    },
  };
}
