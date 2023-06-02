import galite from "ga-lite/src/ga-lite.js";
import { storeItem, loadItem, allClosest } from "./dom-utils.js";
import { recordNewsletterSignup } from "./metrics.js";

// Ensure a Google Analytics window func
if (!window.ga) {
  window.ga = galite;
}

export const DO_NOT_TRACK_KEY = "do-not-track";

let dnt = loadItem(DO_NOT_TRACK_KEY);

// eslint-disable-next-line no-unused-vars
function sendPlausible(action, params = {}) {
  if (dnt) {
    // eslint-disable-next-line no-console
    console.log("Analytics", action, params);
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

function callGA(...args) {
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

window.dataLayer = window.dataLayer || [];

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

function buildGA(action, params = {}) {
  if (action === "click") {
    return [
      "send",
      "event",
      {
        eventCategory: params.component || "",
        eventLabel: params.pageCategory || "",
        eventAction: params.target || "",
      },
    ];
  }
  if (action === "form") {
    return [
      "send",
      "event",
      {
        eventCategory: params.component || "",
        eventLabel: params.pageCategory || "",
        eventAction: params.form + ":" + params.action,
      },
    ];
  }
  if (action === "view") {
    return [
      "send",
      "event",
      {
        eventCategory: params.component || "",
        eventLabel: params.pageCategory || "",
        eventAction: `view:${params.component}`,
        nonInteraction: true,
      },
    ];
  }
  return ["send", "event", { eventAction: JSON.stringify(params) }];
}

function callAnalytics(action, params = {}) {
  callGA4(action, params);
  callGA(...buildGA(action, params));
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
  let { gaId, gaPageTitle, gaPagePath, gaPageUrl, byline } = el.dataset;

  let kind = allClosest(document.body, "[data-ga-label]")
    .map((el) => el.dataset.gaLabel)
    .join(":");
  // TODO: Add byline; 404
  callGA4("page_view", { pageCategory: kind, title: gaPageTitle, byline });

  callGA("create", gaId, "auto");
  callGA("send", "pageview", gaPagePath, {
    title: gaPageTitle,
    location: gaPageUrl,
  });

  window.addEventListener("pagehide", () => {
    callGA("send", "event", {
      transport: "beacon",
      nonInteraction: true,
    });
  });

  window.addEventListener("error", (ev) => {
    callGA("send", "exception", {
      exDescription: ev.message,
      exFatal: true,
    });
    callGA4("error", {
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
