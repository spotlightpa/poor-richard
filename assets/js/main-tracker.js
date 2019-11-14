import { callGA, ensureGA } from "./google-analytics.js";

(() => {
  let dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
  let doNotTrack = dnt == "1" || dnt == "yes";
  if (doNotTrack) {
    return;
  }

  callGA("create", "UA-141126362-3", "auto", "spotlightpa");
  callGA("spotlightpa.set", "anonymizeIp", true);
  callGA("spotlightpa.send", "pageview");

  if (document.readyState === "loading") {
    window.addEventListener("load", ensureGA);
  } else {
    ensureGA();
  }
})();
