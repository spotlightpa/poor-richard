import { focus, blur } from "../utils/active-element.js";
import { buildAndSend } from "../utils/google-analytics.js";
import {
  onTestPage,
  showModalNewsletter,
  sawModalNewsletter,
} from "../utils/metrics.js";

const delay = onTestPage ? 500 : 2000; // 2s

export default function modal() {
  return {
    isOpen: false,

    get modalClass() {
      return { "is-active": this.isOpen };
    },

    trigger() {
      if (showModalNewsletter()) {
        window.setTimeout(() => {
          this.show();
        }, delay);
      }
    },

    show() {
      if (window.matchMedia("(prefers-reduced-motion), (speech)").matches) {
        // eslint-disable-next-line no-console
        console.warn("aborting modal display");
        return;
      }
      this.$dispatch("close-sticky");
      this.isOpen = true;
      sawModalNewsletter();
      buildAndSend(this.$el, {
        eventAction: "modal:newsletter:open",
        nonInteraction: true,
      });

      document.body.parentElement.classList.add("is-clipped");

      this.$nextTick(() => {
        focus(this.$refs.content);
      });
    },

    close(sendEvent = true) {
      this.isOpen = false;
      document.body.parentElement.classList.remove("is-clipped");

      if (sendEvent) {
        buildAndSend(this.$el, {
          eventAction: "modal:newsletter:dismiss",
        });
      }
      this.$nextTick(() => {
        blur(this.$refs.content);
      });
    },
  };
}
