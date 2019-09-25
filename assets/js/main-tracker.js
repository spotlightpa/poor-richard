(() => {
  let dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
  let doNotTrack = dnt == "1" || dnt == "yes";
  if (doNotTrack) {
    return;
  }

  window.ga =
    window.ga ||
    function() {
      (ga.q = ga.q || []).push(arguments);
    };

  ga.l = +new Date();

  ga("create", "UA-141126362-3", "auto", "spotlightpa");
  ga("spotlightpa.set", "anonymizeIp", true);
  ga("spotlightpa.send", "pageview");

  function ensureGA() {
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

  if (document.readyState === "loading") {
    window.addEventListener("load", ensureGA);
  } else {
    ensureGA();
  }
})();
