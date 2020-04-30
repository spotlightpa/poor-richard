import { sendGAEvent } from "../utils/google-analytics.js";
import randomChoice from "../utils/random-choice.js";

export default function sticky() {
  return {
    isOpen: false,
    images: [],

    init() {
      this.images = JSON.parse(this.$el.dataset.images);
    },

    get imageURL() {
      if (!this.images.length) {
        return "";
      }
      return randomChoice(this.images);
    },

    get stickyClass() {
      return this.isOpen ? "is-active" : "";
    },

    show() {
      this.isOpen = true;
      sendGAEvent({
        eventCategory: "Sticky Banner",
        eventAction: "Show sticky banner",
      });
    },

    close() {
      this.isOpen = false;
      sendGAEvent({
        eventCategory: "Sticky Banner",
        eventAction: "Dismiss sticky banner",
      });
    },

    analytics($event) {
      let { href = "" } = $event.target;
      sendGAEvent({
        eventCategory: "Sticky Banner",
        eventAction: "click",
        eventLabel: href,
        transport: "beacon",
      });
      sendGAEvent({
        eventCategory: "Internal Link",
        eventAction: "Sticky Banner",
        eventLabel: href,
        transport: "beacon",
      });
    },
  };
}
