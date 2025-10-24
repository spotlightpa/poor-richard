import { apdate } from "journalize";

import imgproxy from "../utils/imgproxy-url.js";
import fetchJSON from "../utils/fetch-json.js";

const appID = `5M1ASV9W0A`;
const publicKey = `fd9492397caaffd9cb49be210170e63a`;
const indexName = `spotlightpa-content`;

let baseURL = `https://${appID}-dsn.algolia.net/1/indexes/${indexName}?x-algolia-agent=spotlightpa&x-algolia-application-id=${appID}&x-algolia-api-key=${publicKey}&`;

let initialQuery = "";
let searchParams = new URLSearchParams(window.location.search);
if (searchParams.get("from") === "sitelinks") {
  initialQuery = searchParams.get("q");
}

function searchAPI(query, page = 0) {
  if (!query) {
    return Promise.resolve(null);
  }
  let params = { query, page };
  return fetchJSON(baseURL + new URLSearchParams(params).toString());
}

const baseWidth = 256;
const aspectRatio = 16 / 9;
let width = Math.ceil(window.devicePixelRatio * baseWidth);
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

export default function searchArticles() {
  return {
    query: initialQuery,
    results: null,
    error: null,
    isLoading: false,
    page: 0,

    init() {
      this.search();
      this.$watch("query", () => {
        this.page = 0;
        this.search();
      });
    },

    search() {
      if (!this.query) {
        this.isLoading = false;
        this.results = null;
        this.error = null;
        return;
      }
      this.isLoading = true;
      searchAPI(this.query, this.page)
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
      let msg = `Got ${nHits} search results.`;
      let nbPages = this.results?.nbPages;
      if (nbPages > 1) {
        msg += ` Showing results page ${this.page + 1} of ${nbPages}.`;
      }
      return msg;
    },

    scrollToTop() {
      // Seems to need to wait to scroll to prevent layout jank
      window.setTimeout(() => {
        this.$refs.top.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    },

    get hasNextPage() {
      let nbPages = this.results?.nbPages ?? 0;
      return this.page + 1 < nbPages;
    },

    async nextPage() {
      this.page++;
      this.search();
      this.scrollToTop();
    },

    get hasPreviousPage() {
      return this.page > 0;
    },

    previousPage() {
      this.page--;
      this.search();
      this.scrollToTop();
    },
  };
}
