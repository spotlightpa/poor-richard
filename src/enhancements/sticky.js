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
        eventCategory: "news:page:featured",
        eventAction: "modal:sticky",
        eventLabel: "sticky:open",
      });
      this.oldFocus = document.activeElement;
      const transitionLength = 500;
      window.setTimeout(() => this.$refs.close.focus(), transitionLength);
    },

    close() {
      this.isOpen = false;
      this.oldFocus.focus();
      sendGAEvent({
        eventCategory: "news:page:featured",
        eventAction: "modal:sticky",
        eventLabel: "sticky:dimiss",
      });
    },
  };
}
