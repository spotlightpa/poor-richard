import { sendGAEvent, buildEvent } from "../utils/google-analytics.js";
import {
  onTestPage,
  showModalDonate,
  sawModalDonate,
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
      if (showModalDonate) {
        window.setTimeout(() => {
          this.show();
        }, delay);
      }
    },

    show() {
      sawModalDonate();
      let gaEvent = buildEvent(this.$el);
      gaEvent.eventAction = "modal:donate:open";
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
        gaEvent.eventAction = "modal:donate:dismiss";
        sendGAEvent(gaEvent);
      }
    },
  };
}
