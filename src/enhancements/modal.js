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

    init() {
      this.$watch("isOpen", (val) => {
        if (val) {
          this.$dispatch("close-sticky");
          sawModalNewsletter();
          buildAndSend(this.$el, {
            eventAction: "modal:newsletter:open",
            nonInteraction: true,
          });
        } else {
          this.$report({ target: this.$refs.closer });
        }
      });
    },

    get modalClass() {
      return { "is-active": this.isOpen };
    },

    trigger() {
      if (window.matchMedia("(prefers-reduced-motion), (speech)").matches) {
        // eslint-disable-next-line no-console
        console.warn("aborting modal display");
        return;
      }
      if (showModalNewsletter()) {
        window.setTimeout(() => {
          this.isOpen = true;
        }, delay);
      }
    },
  };
}
