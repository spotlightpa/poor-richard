export default {
  name: "WindowListener",
  props: {
    event: String,
  },
  mounted() {
    let eventName = this.event;
    let listener = (ev) => void this.$emit(eventName, ev);
    window.addEventListener(eventName, listener);

    this.removeListener = () =>
      void window.removeEventListener(eventName, listener);
  },
  beforeDestroy() {
    this.removeListener && this.removeListener();
  },
  render() {
    return;
  },
};
