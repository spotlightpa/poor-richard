import { Framer } from "@newswire/frames";

import { each, onLoad } from "../utils/dom-utils.js";

onLoad(() => {
  each("[data-spl-src]", el => {
    // Bail if we were already attached or wrong embed version
    if (el.shadowRoot || el.dataset.splEmbedVersion !== "1") {
      return;
    }
    let src = el.dataset.splSrc;
    // Use shadowDOM to override CSS for iframes
    let container =
      "attachShadow" in el ? el.attachShadow({ mode: "open" }) : el;
    let sandbox =
      "allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation";

    new Framer({ container, src, sandbox });
  });
});
