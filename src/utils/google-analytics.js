import galite from "ga-lite/src/ga-lite.js";
import { storeItem, loadItem, allClosest } from "./dom-utils.js";
import { recordNewsletterSignup } from "./metrics.js";

// Ensure a Google Analytics window func
if (!window.ga) {
  window.ga = galite;
}

export const DO_NOT_TRACK_KEY = "do-not-track";

let dnt = loadItem(DO_NOT_TRACK_KEY);

function buildPlausible(...args) {
  let [send, action, params] = args;
  if (send !== "send") return ["", null];
  if (action === "pageview") {
    let kind = allClosest(document.body, "[data-ga-label]")
      .map((el) => el.dataset.gaLabel)
      .join(":");
    let el = document.querySelector("[data-ga-settings]");
    let title = document.title;
    if (el) {
      title = el.dataset.gaPageTitle;
    } else {
      // eslint-disable-next-line no-console
      console.warn("could not find page title!");
    }
    return ["pageview", { "page-kind": kind, title }];
  }
  if (action === "exception") {
    return ["exception", params];
  }
  if (action !== "event") {
    // eslint-disable-next-line no-console
    console.warn("unknown action!", action);
    return ["", null];
  }
  let { eventCategory, eventAction, eventLabel, nonInteraction } = params;
  if (nonInteraction) {
    return ["", null];
  }
  if (eventAction.startsWith("http")) {
    return [
      "link",
      {
        "page-kind": eventLabel,
        component: eventCategory,
        target: eventAction,
      },
    ];
  }
  if (eventAction.startsWith("view")) {
    return [
      "scrollto",
      {
        "page-kind": eventLabel,
        component: eventCategory,
      },
    ];
  }
  return [
    "event",
    { action: eventAction, "page-kind": eventLabel, component: eventCategory },
  ];
}

function sendPlausible(action, params = {}) {
  if (!action) return;
  let payload = {
    n: action,
    u: location.href,
    d: document.domain,
    r: document.referrer,
    w: window.innerWidth,
    h: 0, // "H"ashmode, not "h"eight
    p: params,
  };
  navigator.sendBeacon(
    "https://plausible.io/api/event",
    JSON.stringify(payload)
  );
}

// TODO: Remove callGA once we have enough data about switching to Plausible or not
export function callGA(...args) {
  let [action, params] = buildPlausible(...args);
  if (dnt) {
    /* eslint-disable no-console */
    console.log("Plausible", action, params);
    console.group("Google Analytics Debug");
    for (let arg of args) console.log("%o", arg);
    console.groupEnd();
    /* eslint-enable no-console */
    return;
  }
  sendPlausible(action, params);
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
  const onDNTPage = !!window.location.href.match(/debug=do-not-track/);
  const onProdSite = !!window.location.host.match(/spotlightpa\.org$/);
  const onDevSite = !!window.location.host.match(
    /(^localhost)|(^spotlightpa\.)|(spotlightpa\.netlify\.app$)/
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

  window.addEventListener(
    "click",
    (ev) => {
      let el = ev.target.closest("a");
      if (!el) return;

      let isInternal =
        el.host === window.location.host || el.host.match(/spotlightpa\.org$/);

      // Open external links in new window
      if (!isInternal) {
        el.target = "_blank";
        el.rel = "noopener noreferrer";
      }

      let gaEvent = buildClick({ target: el });
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
          "701Dn000000YgokIAC";
        let donateURL = `https://spotlightpa.fundjournalism.org/${theme}?campaign=${salesforceCampaign}&utm_source=${source}&utm_medium=${gaEvent.eventLabel}&utm_campaign=${gaEvent.eventCategory}`;
        el.href = donateURL;
      }
    },
    { passive: true }
  );
}

export function analyticsPlugin(Alpine) {
  Alpine.magic("report", () => (ev) => reportClick(ev));

  Alpine.directive("report-click", (el) => {
    el.addEventListener("click", (ev) => reportClick(ev));
  });

  Alpine.directive("form", (el, { expression }) => {
    el.addEventListener("submit", (ev) => {
      let valid = el.reportValidity();
      if (valid) recordNewsletterSignup();
      let validity = valid ? "submit" : "invalid";
      let eventAction = `${expression}:${validity}`;
      buildAndSend(ev.target, {
        eventAction,
      });
    });
    el.addEventListener(
      "focusin",
      (ev) => {
        let eventAction = `${expression}:focus`;
        buildAndSend(ev.target, {
          eventAction,
        });
      },
      {
        once: true,
      }
    );
  });
}
