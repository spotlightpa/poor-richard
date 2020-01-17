import { Framer } from "@newswire/frames";

import { each, onLoad } from "../utils/dom-utils.js";

onLoad(() => {
  each("[data-spl-src]", el => {
    let src = el.dataset.splSrc;
    let container =
      "attachShadow" in el ? el.attachShadow({ mode: "open" }) : el;
    let sandbox = "allow-scripts allow-same-origin allow-forms allow-popups";

    new Framer({ container, src, sandbox });
  });
});
