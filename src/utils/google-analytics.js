import galite from "ga-lite";
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
  const onProdSite = !!window.location.host.match(/spotlightpa\.org$/);
  const onDevSite = !!window.location.host.match(
    /(^localhost)|(spotlightpa\.netlify\.app$)/
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
      let gaEvent = buildEvent(ev.target);

      if (!gaEvent.eventAction) {
        gaEvent.eventAction = ev.target.href;
      }

      if (!gaEvent.eventAction) {
        gaEvent.eventAction = ev.currentTarget.href;
      }
      gaEvent.transport = "beacon";

      sendGAEvent(gaEvent);

      if (isInternal && el.pathname.match(/^\/donate\/?$/)) {
        let source = "spotlightpa.org";
        if (window.frameElement && "URLSearchParams" in window) {
          let hash = window.location.hash.replace(/^#/, "");
          let hostPage = new URLSearchParams(hash).get("host_page");
          if (hostPage) {
            source = new URL(hostPage).host;
          }
        }
        let salesforceCampaign =
          el.closest("[data-ga-sf-campaign]")?.dataset.sfCampaign ||
          "701f4000000TVuXAAW";
        let donateURL = `https://checkout.fundjournalism.org/memberform?org_id=spotlightpa&campaign=${salesforceCampaign}&utm_source=${source}&utm_medium=${gaEvent.eventLabel}&utm_campaign=${gaEvent.eventCategory}`;
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
