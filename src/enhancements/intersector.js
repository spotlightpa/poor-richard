export default function intersector() {
  return {
    eventName: null,
    once: true,
    observer: null,

    init() {
      this.$setAttrs(this, { eventName: "name" });

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
