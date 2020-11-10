import { focus, blur } from "../utils/active-element.js";
import { sendGAEvent, buildEvent } from "../utils/google-analytics.js";
import {
  onTestPage,
  showModalNewsletter,
  sawModalNewsletter,
} from "../utils/metrics.js";

const delay = onTestPage ? 500 : 2000; // 2s

export default function modal() {
  const transitionLength = 500;

  return {
    isOpen: false,

    get modalClass() {
      return { "is-active": this.isOpen };
    },

    init() {
      if (showModalNewsletter) {
        window.setTimeout(() => {
          this.show();
        }, delay);
      }
    },

    show() {
      this.isOpen = true;
      sawModalNewsletter();
      let gaEvent = buildEvent(this.$el);
      gaEvent.eventAction = "modal:newsletter:open";
      gaEvent.nonInteraction = true;
      sendGAEvent(gaEvent);

      document.body.parentElement.classList.add("is-clipped");

      window.setTimeout(() => {
        focus(this.$refs.content);
      }, transitionLength);
    },

    close(sendEvent = true) {
      this.isOpen = false;
      document.body.parentElement.classList.remove("is-clipped");

      if (sendEvent) {
        let gaEvent = buildEvent(this.$el);
        gaEvent.eventAction = "modal:newsletter:dismiss";
        sendGAEvent(gaEvent);
      }
      window.setTimeout(() => {
        blur(this.$refs.content);
      }, transitionLength);
    },
  };
}
