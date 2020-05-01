export default function intersector(eventName, { once = true } = {}) {
  return {
    eventName,
    once,
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
      if (Array.from(entries).some((entry) => entry.isIntersecting)) {
        let event = new CustomEvent(this.eventName, {
          detail: entries,
          bubbles: true,
        });
        window.dispatchEvent(event);
        if (this.once) {
          this.observer.disconnect();
        }
      }
    },
  };
}
