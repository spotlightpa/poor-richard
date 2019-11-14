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
