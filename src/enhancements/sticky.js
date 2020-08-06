import {
  sendGAEvent,
  reportClick as analytics,
} from "../utils/google-analytics.js";

export default function sticky() {
  return {
    analytics,
    isOpen: false,
    oldFocus: null,

    init() {},

    get stickyClass() {
      return this.isOpen ? "is-active" : "";
    },

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
      this.oldFocus.focus();
      sendGAEvent({
        eventLabel: "news:page:featured",
        eventCategory: "modal:sticky",
        eventAction: "sticky:dimiss",
      });
    },
  };
}
