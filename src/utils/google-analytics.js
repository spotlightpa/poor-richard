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
    JSON.stringify(payload)
  );
}

window.dataLayer = window.dataLayer || [];

// eslint-disable-next-line no-unused-vars
function callGA4(action, params = {}) {
  if (dnt) {
    // eslint-disable-next-line no-console
    console.log("GA4", action, params);
    return;
  }
  window.dataLayer.push({
    event: action,
    ...params,
  });
}

function callAnalytics(action, params = {}) {
  sendPlausible(action, params);
}

function buildActionParams(el) {
  let component = allClosest(el, "[data-ga-category]")
    .map((el) => el.dataset.gaCategory)
    .join(":");
  let eventAction = allClosest(el, "[data-ga-action]")
    .map((el) => el.dataset.gaAction)
    .join(":");
  let pageCategory = allClosest(el, "[data-page-cat]")
    .map((el) => el.dataset.pageCat)
    .join(":");

  return [
    eventAction,
    {
      component,
      pageCategory,
    },
  ];
}

function buildAndReport(el, action = "", overrides = {}) {
  let [elAction, params] = buildActionParams(el);
  callAnalytics(action || elAction, { ...params, ...overrides });
}

function normalizeLink(target) {
  if (!target) return "";

  target = target.replace(
    /^(https?:\/\/(www\.)?spotlightpa\.org)/,
    "https://www.spotlightpa.org"
  );
  if (target.match(/checkout\.fundjournalism\.org\/memberform/)) {
    target = "https://www.spotlightpa.org/donate/";
  }
  if (target.match(/^https:\/\/www\.spotlightpa\.org.*[^/]$/)) {
    target = target + "/";
  }
  return target;
}

export function reportClick(ev) {
  let target = ev.target.href;
  if (!target || !target.replace) {
    target = ev.currentTarget?.href;
  }
  target = normalizeLink(target);
  let elAction = ev.target.closest("[data-ga-action]");
  if (elAction) {
    target = elAction.dataset.gaAction || target;
  }

  buildAndReport(ev.target, "click", { target });
}

export function reportView(el) {
  buildAndReport(el, "view");
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

      reportClick(ev);

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
    { passive: true }
  );
}

export function analyticsPlugin(Alpine) {
  Alpine.magic("report", () => (ev) => reportClick(ev));
  Alpine.magic("view", () => (el) => reportView(el));

  Alpine.directive("report-click", (el) => {
    el.addEventListener("click", (ev) => reportClick(ev));
  });

  Alpine.directive("form", (el, { expression }) => {
    el.addEventListener("submit", (ev) => {
      let valid = el.reportValidity();
      if (valid) recordNewsletterSignup();
      let validity = valid ? "submit" : "invalid";
      buildAndReport(ev.target, "form", { form: expression, action: validity });
    });
    el.addEventListener(
      "focusin",
      (ev) => {
        buildAndReport(ev.target, "form", {
          form: expression,
          action: "focus",
        });
      },
      {
        once: true,
      }
    );
  });
}
