import {
  sendGAEvent,
  reportClick as analytics,
} from "../utils/google-analytics.js";

export default function sticky() {
  return {
    analytics,
    isOpen: false,
    oldFocus: null,

    show() {
      this.isOpen = true;
      sendGAEvent({
        eventLabel: "news:page:featured",
        eventCategory: "modal:sticky",
        eventAction: "sticky:open",
      });
      this.oldFocus = document.activeElement;
      const transitionLength = 500;
      window.setTimeout(() => this.$refs.close.focus(), transitionLength);
    },

    close() {
      this.isOpen = false;
      const transitionLength = 500;
      window.setTimeout(() => this.oldFocus.focus(), transitionLength);
      sendGAEvent({
        eventLabel: "news:page:featured",
        eventCategory: "modal:sticky",
        eventAction: "sticky:dimiss",
      });
    },
  };
}
