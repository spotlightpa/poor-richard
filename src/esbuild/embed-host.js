import { Framer } from "@newswire/frames";

import { each, onLoad } from "../utils/dom-utils.js";

onLoad(() => {
  if (window.splEmbedLoaded) {
    return;
  }

  window.splEmbedLoaded = true;

  each("[data-spl-src]", (el) => {
    // Bail if we were already attached or wrong embed version
    if (el.shadowRoot || el.dataset.splEmbedVersion !== "1") {
      return;
    }
    // Bail if user can't support URLSearchParams
    if (!window.URLSearchParams) {
      return;
    }
    let src = el.dataset.splSrc;
    if (!/^(\/|http)/.test(src)) {
      // eslint-disable-next-line no-console
      console.warn("bad embed URL", src);
      return;
    }
    src += "#host_page=" + encodeURIComponent(window.location.href);
    // Use shadowDOM to override CSS for iframes
    let container =
      "attachShadow" in el ? el.attachShadow({ mode: "open" }) : el;
    let sandbox =
      "allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation";
    let attributes = { sandbox };

    new Framer(container, { src, attributes });
  });
});
