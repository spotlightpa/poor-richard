export default function intersector(eventName) {
  return {
    eventName,
    once: true,
    observer: null,

    init() {
      if (!("IntersectionObserver" in window)) {
        return;
      }
      this.observer = new IntersectionObserver((entries, observer) => {
        this.callback(entries, observer);
      });
      this.observer.observe(this.$el);
    },

    callback(entries) {
      if (!Array.from(entries).some((entry) => entry.isIntersecting)) {
        return;
      }
      this.$dispatch(this.eventName, { detail: entries });
      if (this.once) {
        this.observer.disconnect();
      }
    },
  };
}
