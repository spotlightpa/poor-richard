import { focus, blur } from "../utils/active-element.js";
import { buildEvent, sendGAEvent } from "../utils/google-analytics.js";

export default function sticky() {
  const transitionLength = 500;

  return {
    isOpen: false,

    show() {
      this.isOpen = true;
      this.sendEvent("sticky:open");
      window.setTimeout(() => focus(this.$refs.close), transitionLength);
    },

    close() {
      this.isOpen = false;
      this.sendEvent("sticky:close");
      window.setTimeout(() => blur(this.$refs.close), transitionLength);
    },

    sendEvent(action) {
      let event = buildEvent(this.$el);
      sendGAEvent({
        ...event,
        eventAction: action,
      });
    },
  };
}
