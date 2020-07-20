import { apdate } from "journalize";

import imgproxy from "../utils/imgproxy-url.js";
import { sendGAEvent } from "../utils/google-analytics.js";
import searchAPI from "../utils/search-api.js";
import { debouncer } from "../utils/timers.js";

function roundUp(n, by) {
  return by * Math.ceil(n / by);
}

function normalize(obj) {
  return {
    title: obj["link-title"] || obj.hed,
    url: obj.URL || "",
    byline: obj.byline || "",
    imageCredit: obj["image-credit"] || "",
    imageDescription: obj["image-description"] || "",
    kicker: obj.kicker || "",
    publishedISO: obj["pub-date"] || "",
    get imageSource() {
      return obj["image-url"] || "";
    },
    get published() {
      return apdate(new Date(this.publishedISO));
    },
  };
}

const magicPixel =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

export default function searchArticles() {
  return {
    query: "",
    results: null,
    error: null,
    isLoading: false,
    magicPixel,

    init() {
      const bouncedSearch = debouncer({ milliseconds: 500 }, () =>
        searchAPI(this.query)
          .then((results) => {
            this.error = null;
            if (results) {
              this.results = results;
            }
          })
          .catch((error) => {
            this.isLoading = false;
            this.error = error;
          })
          .finally(() => {
            this.isLoading = false;
          })
      );

      this.$watch("query", () => {
        this.isLoading = true;
        bouncedSearch();
      });
    },

    get stories() {
      if (!this.results || !this.results.hits) {
        return [];
      }
      return this.results.hits.map(normalize);
    },

    get resultsCount() {
      return this.results?.nbHits ?? 0;
    },

    get resultsText() {
      let nHits = this.resultsCount;
      if (!nHits) {
        return "No search results";
      }
      if (nHits === 1) {
        return "Got one search result.";
      }
      let nStories = this.results?.hits?.length ?? 0;
      let more = nHits > nStories ? `Showing first ${nStories}.` : "";
      return `Got ${nHits} search results. ${more}`;
    },

    loadImage(ev) {
      let el = ev.target;
      let { src } = el.dataset;
      if (el.src !== this.magicPixel || src === "") {
        return;
      }
      let { width = 0, height = 0 } = el;
      let aspectRatio = height / width;
      width = roundUp(window.devicePixelRatio * width, 100);
      height = Math.round(aspectRatio * width);
      el.src = imgproxy(src, { width, height });
    },

    analytics($event) {
      let { href = "" } = $event.target;
      sendGAEvent({
        eventCategory: "Internal Link",
        eventAction: "Search",
        eventLabel: href,
        transport: "beacon",
      });
    },
  };
}
