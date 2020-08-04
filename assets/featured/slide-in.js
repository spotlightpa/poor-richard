import "alpinejs";

function callGA(...args) {
  if (!window.location.href.match(/spotlightpa\.org/)) {
    // eslint-disable-next-line no-console
    console.info("GA", JSON.stringify(args));
    return;
  }
  window.ga(...args);
}

function sendGAEvent(ev) {
  callGA("send", "event", ev);
}

function sendEvent({
  el = window,
  name,
  detail = null,
  bubbles = true,
  cancelable = true,
  composed = true,
}) {
  el.dispatchEvent(
    new CustomEvent(name, {
      detail,
      bubbles,
      cancelable,
      composed,
    })
  );
}

function intersector(eventName, { once = true } = {}) {
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
      if (!Array.from(entries).some((entry) => entry.isIntersecting)) {
        return;
      }
      sendEvent({ el: this.$el, name: this.eventName, detail: entries });
      if (this.once) {
        this.observer.disconnect();
      }
    },
  };
}

function sticky() {
  return {
    isOpen: false,
    oldFocus: null,

    init() {},

    get stickyClass() {
      return this.isOpen ? "is-active" : "";
    },

    show() {
      this.isOpen = true;
      sendGAEvent({
        eventCategory: "news:page:featured",
        eventAction: "modal:sticky",
        eventLabel: "sticky:open",
      });
      this.oldFocus = document.activeElement;
      const transitionLength = 500;
      window.setTimeout(() => this.$refs.close.focus(), transitionLength);
    },

    close() {
      this.isOpen = false;
      this.oldFocus.focus();
      sendGAEvent({
        eventCategory: "news:page:featured",
        eventAction: "modal:sticky",
        eventLabel: "sticky:dimiss",
      });
    },

    analytics($event) {
      let { href = "" } = $event.currentTarget;
      sendGAEvent({
        eventCategory: "news:page:featured",
        eventAction: "modal:sticky",
        eventLabel: href,
        transport: "beacon",
      });
    },
  };
}

window.spl = Object.assign({}, window.spl, {
  intersector,
  sticky,
});
