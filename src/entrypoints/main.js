import { each, on, onLoad } from "../utils/dom-utils.js";
import { addSocialButtonListeners } from "../utils/social.js";
import { addGAListeners } from "../utils/google-analytics.js";
import "../utils/metrics.js";

function createListeners() {
  on("click", "[data-target]", (ev) => {
    let targets = ev.currentTarget.dataset.target;
    let toggleClass = ev.currentTarget.dataset.toggleClass;
    toggleClass = toggleClass ? toggleClass : "is-active";

    each(targets, (el) => {
      el.classList.toggle(toggleClass);
    });
  });
  on("click", "a[data-gone]", (ev) => {
    ev.preventDefault();
    let url = ev.currentTarget.dataset.gone;
    let msg =
      "The target of this link has been removed. " +
      `It pointed to ${url}. ` +
      "Would you like to try to visit anyway?";
    if (window.confirm(msg)) {
      window.location = url;
    }
  });

  addGAListeners();
  addSocialButtonListeners();

  try {
    import("../utils/enhancements.js").then((module) => {
      module.load();
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("could not load enhancements", e);
    document.body.classList.add("has-old-js");
  }
}

onLoad(createListeners);
