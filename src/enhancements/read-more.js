import fetchJSON from "../utils/fetch-json.js";
import imgproxy from "../utils/imgproxy-url.js";

function roundUp(n, by) {
  return by * Math.ceil(n / by);
}

function toStory(data, { width, height }) {
  return {
    ...data,
    get imageURL() {
      let image = data.image || "2019/11/banner-white-on-capitol.jpeg";
      return imgproxy(image, { width, height });
    },
  };
}

export default function readMore(showDate = false) {
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
        Array.from(this.$refs.root.querySelectorAll("a")).map(
          (el) => el.pathname,
        ),
      );
      hrefs.add(window.location.pathname);

      // Figure out the right image size to request
      let { width = 1, height = 0 } =
        this.$refs.archives.querySelector("figure img");
      let aspectRatio = height / width;
      width = roundUp(window.devicePixelRatio * width, 1);
      height = Math.round(aspectRatio * width);

      fetchJSON(this.$refs.feedSrc.href)
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
      this.counter += 25;
    },
  };
}
