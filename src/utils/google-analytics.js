import { storeItem, loadItem, allClosest } from "./dom-utils.js";
import { recordNewsletterSignup, funnelStatus } from "./metrics.js";

export const DO_NOT_TRACK_KEY = "do-not-track";

let dnt = loadItem(DO_NOT_TRACK_KEY);

function sendPlausible(action, params = {}) {
  if (dnt) {
    // eslint-disable-next-line no-console
    console.log("Plausible", action, params);
    return;
  }

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
    JSON.stringify(payload),
  );
}

function buildGAClasses(el) {
  let component = allClosest(el, "[data-ga-category]")
    .map((el) => el.dataset.gaCategory)
    .join(":");
  el.classList.add(`ga:component:${component}`);
}

export function addGAListeners() {
  const onDNTPage = !!window.location.href.match(/debug=do-not-track/);
  const onProdSite = !!window.location.host.match(/spotlightpa\.org$/);
  const onDevSite = !!window.location.host.match(
    /(^localhost)|(^spotlightpa\.)|(spotlightpa\.netlify\.app$)/,
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
    console.warn("could not report page view!");
    return;
  }
  let { gaPageTitle, byline } = el.dataset;

  let pageCategory = allClosest(document.body, "[data-page-cat]")
    .map((el) => el.dataset.pageCat)
    .join(":");
  // TODO: Add 404
  sendPlausible("pageview", {
    pageCategory,
    title: gaPageTitle,
    byline,
    funnelStatus,
  });

  window.addEventListener("error", (ev) => {
    sendPlausible("error", {
      message: ev.message,
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

        let medium = allClosest(el, "[data-page-cat]")
          .map((el) => el.dataset.pageCat)
          .join(":");
        let campaign = allClosest(el, "[data-ga-category]")
          .map((el) => el.dataset.gaCategory)
          .join(":");
        let donateURL = `https://spotlightpa.fundjournalism.org/${theme}?campaign=${salesforceCampaign}&utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}`;
        el.href = donateURL;
      }
    },
    { passive: true },
  );

  let links = document.querySelectorAll("a");
  for (let el of links) {
    window.setTimeout(() => {
      buildGAClasses(el);
    }, 0);
  }
}

export function analyticsPlugin(Alpine) {
  Alpine.directive("report-click", (el) => {
    buildGAClasses(el);
  });

  Alpine.directive("form", (el) => {
    buildGAClasses(el);
    el.addEventListener("submit", () => {
      let valid = el.reportValidity();
      if (valid) recordNewsletterSignup();
    });
  });
}
