import { each, on, polyfillClosest } from "./dom-utils.js";

// Ensure a Google Analytics window func
if (!window.ga) {
  window.ga = function() {
    (window.ga.q = window.ga.q || []).push(arguments);
  };
  window.ga.l = +new Date();
}

export function callGA(...args) {
  window.ga(...args);
}

export function sendGAEvent(ev) {
  window.ga("send", "event", ev);
}

export function ensureGA() {
  let hasGA = Array.from(document.scripts).find(el =>
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

  each("a", el => {
    let isInternal =
      el.host === window.location.host || el.host.match(/spotlightpa\.org$/);

    // Open external links in new window
    if (!isInternal) {
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    }

    on("click", el, ev => {
      let { gaEvent } = ev.currentTarget.dataset;
      if (gaEvent) {
        gaEvent = JSON.parse(gaEvent);
        sendGAEvent(gaEvent);
        return;
      }

      let eventCategory = isInternal ? "Internal Link" : "Outbound Link";
      let eventAction = "click";
      let parentAction = el.closest("[data-ga-action]");
      if (parentAction) {
        eventAction = parentAction.dataset.gaAction;
      }

      sendGAEvent({
        eventCategory,
        eventAction,
        eventLabel: ev.currentTarget.href,
        transport: "beacon"
      });
    });
  });

  on("submit", "[data-ga-form]", ev => {
    let form = ev.target;
    let isValid = form.reportValidity();

    let gaEvent = JSON.parse(ev.currentTarget.dataset.gaForm);
    gaEvent.transport = "beacon";
    gaEvent.eventLabel = isValid ? "submit" : "invalid submission";
    sendGAEvent(gaEvent);
  });
}
