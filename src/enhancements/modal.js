import { sendGAEvent, buildEvent } from "../utils/google-analytics.js";
import {
  onTestPage,
  showModalNewsletter,
  sawModalNewsletter,
} from "../utils/metrics.js";

const delay = onTestPage ? 500 : 2000; // 2s

export default function modal() {
  return {
    oldFocus: null,
    isOpen: false,

    get modalClass() {
      return this.isOpen ? "is-active" : "";
    },

    init() {
      if (showModalNewsletter) {
        window.setTimeout(() => {
          this.show();
        }, delay);
      }
    },

    show() {
      sawModalNewsletter();
      let gaEvent = buildEvent(this.$el);
      gaEvent.eventAction = "modal:newsletter:open";
      gaEvent.nonInteraction = true;
      sendGAEvent(gaEvent);

      this.isOpen = true;

      document.body.parentElement.classList.add("is-clipped");

      this.oldFocus = document.activeElement;
      this.$nextTick(() => {
        this.$refs.content.focus();
      });
    },

    close(sendEvent = true) {
      this.oldFocus.focus();
      document.body.parentElement.classList.remove("is-clipped");

      this.isOpen = false;
      if (sendEvent) {
        let gaEvent = buildEvent(this.$el);
        gaEvent.eventAction = "modal:newsletter:dismiss";
        sendGAEvent(gaEvent);
      }
    },
  };
}
