import fetchJSON from "../utils/fetch-json.js";

export default function mostPopular() {
  return {
    hasLoaded: false,
    isLoading: false,
    stories: [],
    error: null,

    init() {
      if (this.isLoading || this.hasLoaded) return;
      this.isLoading = true;

      fetchJSON(this.$refs.mostPopSrc.href)
        .then((data) => {
          this.isLoading = false;
          this.hasLoaded = true;
          this.error = null;
          let stories = data.pages ?? [];
          this.stories = stories.slice(0, 5);
        })
        .catch((err) => {
          this.isLoading = false;
          this.error = err;
        });
    },
  };
}
