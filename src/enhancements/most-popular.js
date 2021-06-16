import fetchJSON from "../utils/fetch-json.js";
import { reportClick as analytics } from "../utils/google-analytics.js";

export default function mostPopular() {
  return {
    analytics,
    hasLoaded: false,
    isLoading: false,
    fetchedStories: [],
    fetchRankings: [],
    error: null,

    init() {
      if (this.isLoading || this.hasLoaded) return;
      this.isLoading = true;

      Promise.all([
        fetchJSON(this.$refs.feedSrc.href),
        fetchJSON(this.$refs.mostPopSrc.href),
      ])
        .then(([stories, rankings]) => {
          this.isLoading = false;
          this.hasLoaded = true;
          this.error = null;
          this.fetchedStories = stories.items;
          this.fetchedRankings = rankings.pages;
        })
        .catch((err) => {
          this.isLoading = false;
          this.error = err;
        });
    },

    get stories() {
      if (!this.hasLoaded) {
        return [];
      }
      let stories = new Map(
        this.fetchedStories.map((story) => [story.url, story])
      );

      return this.fetchedRankings
        .map((path) => stories.get(path))
        .filter((story) => !!story)
        .slice(0, 5);
    },
  };
}
