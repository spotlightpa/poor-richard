import fetchJSON from "../utils/fetch-json.js";
import { reportClick as analytics } from "../utils/google-analytics.js";

export default function feed() {
  return {
    analytics,
    feedURL: "",
    formatDate: null,

    hasLoaded: false,
    isLoading: false,
    fetchedObj: {},
    error: null,

    init() {
      if (this.isLoading || this.hasLoaded) return;

      ({ feedUrl: this.feedURL } = this.$attrs);

      let datestringer = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      this.formatDate = (date) => datestringer.format(new Date(date));

      this.isLoading = true;

      fetchJSON(this.feedURL)
        .then((feed) => {
          this.isLoading = false;
          this.hasLoaded = true;
          this.error = null;
          this.fetchedObj = feed;
        })
        .catch((err) => {
          this.isLoading = false;
          this.error = err;
        });
    },

    get items() {
      if (!this.hasLoaded) {
        return [];
      }
      return this.fetchedObj.items;
    },
  };
}
