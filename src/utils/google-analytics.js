import galite from "ga-lite/src/ga-lite.js";
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
  window.ga = galite;
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
  galite(...args);
}

export function sendGAEvent(ev) {
  callGA("send", "event", ev);
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

export function buildAndSend(el, overrides) {
  let event = buildEvent(el);
  sendGAEvent({ ...event, ...overrides });
}

export function buildClick(ev) {
  let gaEvent = buildEvent(ev.target);
  if (!gaEvent.eventAction) {
    gaEvent.eventAction = ev.target.href;
  }

  if (!gaEvent.eventAction || !gaEvent.eventAction.replace) {
    gaEvent.eventAction = ev.currentTarget.href;
  }
  gaEvent.transport = "beacon";
  return normalizeEvent(gaEvent);
}

function normalizeEvent(gaEvent) {
  let { eventAction: action } = gaEvent;
  if (action) {
    action = action.replace(
      /^(https?:\/\/(www\.)?spotlightpa\.org)/,
      "https://www.spotlightpa.org"
    );
    if (action.match(/checkout\.fundjournalism\.org\/memberform/)) {
      action = "https://www.spotlightpa.org/donate/";
    }
    if (action.match(/^https:\/\/www\.spotlightpa\.org.*[^/]$/)) {
      action = action + "/";
    }
    gaEvent.eventAction = action;
  }
  return gaEvent;
}

export function reportClick(ev) {
  let gaEvent = buildClick(ev);

  sendGAEvent(gaEvent);
}

export function addGAListeners() {
  polyfillClosest();

  const onDNTPage = !!window.location.href.match(/debug=do-not-track/);
  const onProdSite = !!window.location.host.match(/spotlightpa\.org$/);
  const onDevSite = !!window.location.host.match(
    /(^goldbook)|(^localhost)|(spotlightpa\.netlify\.app$)|(spotlightpa-org\.pages\.dev$)/
  );

  if (onDNTPage || (dnt === null && !onProdSite)) {
    dnt = true;
    storeItem(DO_NOT_TRACK_KEY, true);
  }

  if (!onProdSite && !onDevSite) {
    window.location = "https://www.spotlightpa.org" + window.location.pathname;
  }

  let el = document.querySelector("[data-ga-settings]");
  if (!el) {
    // eslint-disable-next-line no-console
    console.warn("could not load GA!");
    return;
  }
  let { gaId, gaPageTitle, gaPagePath, gaPageUrl } = el.dataset;

  callGA("create", gaId, "auto");
  callGA("send", "pageview", gaPagePath, {
    title: gaPageTitle,
    location: gaPageUrl,
  });

  window.addEventListener("pagehide", () => {
    sendGAEvent({
      transport: "beacon",
      nonInteraction: true,
    });
  });

  window.addEventListener("error", (ev) => {
    callGA("send", "exception", {
      exDescription: ev.message,
      exFatal: true,
    });
  });

  each("a", (el) => {
    let isInternal =
      el.host === window.location.host || el.host.match(/spotlightpa\.org$/);

    // Open external links in new window
    if (!isInternal) {
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    }

    on("click", el, (ev) => {
      let gaEvent = buildClick(ev);
      sendGAEvent(gaEvent);

      if (isInternal && el.pathname.match(/^\/donate\/?$/)) {
        let source = "www.spotlightpa.org";
        if (window.frameElement && "URLSearchParams" in window) {
          let hash = window.location.hash.replace(/^#/, "");
          let hostPage = new URLSearchParams(hash).get("host_page");
          if (hostPage) {
            source = new URL(hostPage).host;
          }
        }
        let theme = el.closest("[data-sf-theme]")?.dataset.sfTheme || "";
        let salesforceCampaign =
          el.closest("[data-sf-campaign]")?.dataset.sfCampaign ||
          "7015G0000013oXTQAY";
        let donateURL = `https://checkout.fundjournalism.org/memberform?org_id=spotlightpa&theme=${theme}&campaign=${salesforceCampaign}&utm_source=${source}&utm_medium=${gaEvent.eventLabel}&utm_campaign=${gaEvent.eventCategory}`;
        el.href = donateURL;
      }
    });
  });

  on("click", "[data-ga-button]", (ev) => {
    reportClick(ev);
  });

  each("[data-ga-form]", (el) => {
    el.addEventListener(
      "submit",
      () => {
        let validity = el.reportValidity() ? "submit" : "invalid";
        let eventAction = `${el.dataset.gaForm}:${validity}`;
        buildAndSend(el, {
          eventAction,
          transport: "beacon",
        });
        el.dispatchEvent(
          new CustomEvent("x-form-submit", {
            detail: eventAction,
            bubbles: true,
          })
        );
      },
      {
        passive: true,
      }
    );
    el.addEventListener(
      "focus",
      () => {
        let eventAction = `${el.dataset.gaForm}:focus`;
        buildAndSend(el, {
          eventAction,
        });
      },
      {
        once: true,
        capture: true,
        passive: true,
      }
    );
  });
}
