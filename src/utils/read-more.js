import imgproxy from "./imgproxy-url.js";
import { sendGAEvent } from "../utils/google-analytics.js";

function toStory(data, { width, height }) {
  return {
    ...data,
    get imageURL() {
      return imgproxy(data.image, { width, height });
    },
  };
}

export default ({ showDate = false }) => {
  return {
    showDate,
    hasLoaded: false,
    isLoading: false,
    hasClicked: false,
    counter: 0,
    fetchedStories: [],
    error: null,

    load() {
      if (this.isLoading || this.hasLoaded) return;
      this.isLoading = true;

      let hrefs = new Set(
        Array.from(this.$el.querySelectorAll("a")).map((el) => el.pathname)
      );
      // Figure out the right image size to request
      let { width, height } = this.$refs.archives.querySelector("figure img");
      width = window.devicePixelRatio * width;
      height = window.devicePixelRatio * height;

      fetch("/news/feed-summary.json")
        .then((rsp) => rsp.json())
        .then((json) => {
          this.isLoading = false;
          this.hasLoaded = true;
          this.error = null;
          // remove links in this.$el
          this.fetchedStories = json.items
            .filter((item) => !hrefs.has(item.url))
            .map((item) => toStory(item, { width, height }));
        })
        .catch((err) => {
          this.isLoading = false;
          this.error = err;
        });
    },

    get stories() {
      return this.fetchedStories.slice(0, this.counter);
    },

    get loadingClass() {
      return this.hasClicked && this.isLoading ? "is-loading" : "";
    },

    get canReadMore() {
      return !this.hasLoaded || this.counter < this.fetchedStories.length;
    },

    click() {
      this.load();
      this.hasClicked = true;
      this.counter += 10;
    },

    analytics($event) {
      let { href = "" } = $event.target;
      sendGAEvent({
        eventCategory: "Internal link",
        eventAction: "read-more",
        eventLabel: href,
      });
    },
  };
};
