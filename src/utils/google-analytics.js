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

export function buildEvent(el) {
  let eventCategory = allClosest(el, "[data-ga-category]")
    .map((el) => el.dataset.gaCategory)
    .join(":");
  let eventAction = allClosest(el, "[data-ga-action]")
    .map((el) => el.dataset.gaAction)
    .join(":");
  let eventLabel = allClosest(el, "[data-ga-label]")
    .map((el) => el.dataset.gaLabel)
    .join(":");

  return {
    eventCategory,
    eventAction,
    eventLabel,
  };
}

export function reportClick(ev) {
  let gaEvent = buildEvent(ev.target);

  if (!gaEvent.eventAction) {
    gaEvent.eventAction = ev.target.href;
  }

  if (!gaEvent.eventAction) {
    gaEvent.eventAction = ev.currentTarget.href;
  }
  gaEvent.transport = "beacon";

  sendGAEvent(gaEvent);
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

    on("click", el, (ev) => {
      reportClick(ev);
    });
  });

  each("[data-ga-form]", (el) => {
    el.addEventListener(
      "submit",
      () => {
        let gaEvent = buildEvent(el);
        let isValid = el.reportValidity();
        gaEvent.eventAction = el.dataset.gaForm;
        gaEvent.eventAction += isValid ? ":submit" : ":invalid";
        gaEvent.transport = "beacon";
        sendGAEvent(gaEvent);
      },
      {
        passive: true,
      }
    );
    el.addEventListener(
      "focus",
      () => {
        let gaEvent = buildEvent(el);
        gaEvent.eventAction = el.dataset.gaForm;
        gaEvent.eventAction += ":focus";
        sendGAEvent(gaEvent);
      },
      {
        once: true,
        capture: true,
        passive: true,
      }
    );
  });
}
