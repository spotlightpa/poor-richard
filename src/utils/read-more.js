import imgproxy from "./imgproxy-url.js";

export default function readmore() {
  return {
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
        Array.from(this.$el.querySelectorAll("a")).map((el) => el.href)
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

    click() {
      this.load();
      this.hasClicked = true;
      this.counter += 10;
    },
  };
};

function toStory(data, { width, height }) {
  return {
    ...data,
    imageURL: imgproxy(data.image, { width, height }),
  };
}

