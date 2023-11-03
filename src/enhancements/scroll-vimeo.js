export default function scrollVimeo() {
  // The player object must not be returned as data
  // because the Vimeo player does not like
  // to be wrapped by Alpine's reactivity proxy.
  // See https://sebastiandedeyne.com/non-reactive-data-in-alpine-js/
  let player;

  return {
    onScreen: false,
    loaded: null,

    init() {
      this.loaded = this.load(this.$refs.splVideo);
    },

    async load(el) {
      await import("https://player.vimeo.com/api/player.js");
      player = new window.Vimeo.Player(el, {
        height: 576,
        responsive: true,
        loop: true,
        controls: false,
        title: 0,
        sidedock: 0,
        muted: true,
      });
      await player.ready();
    },

    async play() {
      await this.loaded;
      await player.play();
      // eslint-disable-next-line no-console
      console.log("play", this.$refs.splVideo.dataset.vimeoId);
    },

    async pause() {
      await this.loaded;
      await player.pause();
      // eslint-disable-next-line no-console
      console.log("pause", this.$refs.splVideo.dataset.vimeoId);
    },
  };
}
