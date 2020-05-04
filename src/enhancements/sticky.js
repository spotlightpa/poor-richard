import { sendGAEvent } from "../utils/google-analytics.js";
import randomChoice from "../utils/random-choice.js";

export default function sticky() {
  return {
    isOpen: false,
    images: [],
    _imageURL: "",
    oldFocus: null,

    init() {
      this.images = JSON.parse(this.$el.dataset.images);
      let img = new Image();
      img.src = this.imageURL;
    },

    get imageURL() {
      if (!this.images.length) {
        return "";
      }
      if (!this._imageURL) {
        this._imageURL = randomChoice(this.images);
      }
      return this._imageURL;
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
      this.oldFocus = document.activeElement;
      const transitionLength = 500;
      window.setTimeout(() => this.$refs.close.focus(), transitionLength);
    },

    close() {
      this.isOpen = false;
      this.oldFocus.focus();
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
