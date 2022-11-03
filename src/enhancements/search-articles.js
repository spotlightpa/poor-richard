import { apdate } from "journalize";

import imgproxy from "../utils/imgproxy-url.js";
import searchAPI from "../utils/search-api.js";

function roundUp(n, by) {
  return by * Math.ceil(n / by);
}

const baseWidth = 256;
const aspectRatio = 16 / 9;
let width = roundUp(window.devicePixelRatio * baseWidth, 1);
let height = Math.round(width / aspectRatio);

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
    get imageURL() {
      let image = obj["image-url"] || "2019/11/banner-white-on-capitol.jpeg";
      return imgproxy(image, { width, height });
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
      this.$watch("query", () => this.search());
    },

    search() {
      if (!this.query) {
        this.isLoading = false;
        this.results = null;
        this.error = null;
        return;
      }
      this.isLoading = true;
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
      if (this.isLoading || !this.results) {
        return "";
      }
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
      width = roundUp(window.devicePixelRatio * width, 1);
      height = Math.round(aspectRatio * width);
      el.src = imgproxy(src, { width, height });
    },
  };
}
