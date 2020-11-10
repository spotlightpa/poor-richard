import { buildEvent, sendGAEvent } from "../utils/google-analytics.js";

export default function sticky() {
  const transitionLength = 500;

  return {
    isOpen: false,
    oldFocus: null,

    show() {
      this.isOpen = true;
      this.sendEvent("sticky:open");
      this.oldFocus = document.activeElement;
      window.setTimeout(() => this.$refs.close.focus(), transitionLength);
    },

    close() {
      this.isOpen = false;
      this.sendEvent("sticky:close");
      window.setTimeout(() => {
        this.$refs.close.blur();
        this.oldFocus.focus();
      }, transitionLength);
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
