import { sendGAEvent } from "../utils/google-analytics.js";
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
      this.isOpen = true;

      document.body.parentElement.classList.add("is-clipped");

      sendGAEvent({
        eventCategory: "Modal interaction",
        eventAction: `Saw modal newsletter`,
        nonInteraction: true,
      });

      this.oldFocus = document.activeElement;
      window.setTimeout(() => {
        this.$refs.content.focus();
      }, 500);
    },

    focus() {
      sendGAEvent({
        eventCategory: "Modal interaction",
        eventAction: "Focus input",
      });
    },

    submit() {
      sendGAEvent({
        eventCategory: "Modal interaction",
        eventAction: `Submit newsletter`,
        transport: "beacon",
      });
    },

    close() {
      this.oldFocus.focus();
      document.body.parentElement.classList.remove("is-clipped");

      this.isOpen = false;
      sendGAEvent({
        eventCategory: "Modal interaction",
        eventAction: `Dismiss modal newsletter`,
      });
    },
  };
}
