import {
  each,
  on,
  storeItem,
  loadItem,
  polyfillClosest,
  allClosest,
} from "./dom-utils.js";

// Ensure a Google Analytics window func
if (!window.ga) {
  window.ga = function () {
    (window.ga.q = window.ga.q || []).push(arguments);
  };
  window.ga.l = +new Date();
}

export const DO_NOT_TRACK_KEY = "do-not-track";

let dnt = loadItem(DO_NOT_TRACK_KEY);

export function callGA(...args) {
  if (dnt) {
    /* eslint-disable no-console */
    console.group("Google Analytics Debug");
    for (let arg of args) console.log("%o", arg);
    console.groupEnd();
    /* eslint-enable no-console */
    return;
  }
  window.ga(...args);
}

export function sendGAEvent(ev) {
  callGA("send", "event", ev);
}

export function ensureGA() {
  let hasGA = Array.from(document.scripts).find((el) =>
    el.src.match(/google-analytics/)
  );
  if (hasGA) {
    return;
  }
  let s = document.createElement("script");
  s.async = true;
  s.src = "https://www.google-analytics.com/analytics.js";
  document.body.appendChild(s);
}

export function addGAListeners() {
  polyfillClosest();
  const onDNTPage = !!window.location.href.match(/debug=do-not-track/);
  if (onDNTPage) {
    storeItem(DO_NOT_TRACK_KEY, true);
  }

  each("a", (el) => {
    let isInternal =
      el.host === window.location.host || el.host.match(/spotlightpa\.org$/);

    // Open external links in new window
    if (!isInternal) {
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    }

    on("click", el, () => {
      let eventCategory = allClosest(el, "[data-ga-category]")
        .map((el) => el.dataset.gaCategory)
        .join(":");
      let eventAction = allClosest(el, "[data-ga-action]")
        .map((el) => el.dataset.gaAction)
        .join(":");
      let eventLabel = allClosest(el, "[data-ga-label]")
        .map((el) => el.dataset.gaLabel)
        .join(":");

      if (!eventLabel) {
        eventLabel = el.href;
      }

      sendGAEvent({
        eventCategory,
        eventAction,
        eventLabel,
        transport: "beacon",
      });
    });
  });

  on("submit", "[data-ga-form]", (ev) => {
    let form = ev.target;
    let isValid = form.reportValidity();

    let gaEvent = JSON.parse(ev.currentTarget.dataset.gaForm);
    gaEvent.transport = "beacon";
    gaEvent.eventLabel = isValid ? "submit" : "invalid submission";
    sendGAEvent(gaEvent);
  });
}
