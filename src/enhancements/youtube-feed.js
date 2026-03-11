import fetchJSON from "../utils/fetch-json.js";

export default function youtubeFeed() {
  return {
    hasLoaded: false,
    isLoading: false,
    videos: [],
    error: null,

    init() {
      if (this.isLoading || this.hasLoaded) return;
      this.isLoading = true;

      fetchJSON(this.$refs.youtubeFeedSrc.href)
        .then((data) => {
          this.isLoading = false;
          this.hasLoaded = true;
          this.error = null;
          let videos = data.videos ?? [];
          this.videos = videos.slice(0, 4);
        })
        .catch((err) => {
          this.isLoading = false;
          this.error = err;
        });
    },
  };
}
