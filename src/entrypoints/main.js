import { each, on, onLoad } from "../utils/dom-utils.js";
import { addModal } from "../utils/modal.js";
import { addSocialButtonListeners } from "../utils/social.js";
import { addGAListeners } from "../utils/google-analytics.js";

function createListeners() {
  on("click", "[data-target]", (ev) => {
    var targets = ev.currentTarget.dataset.target;
    var toggleClass = ev.currentTarget.dataset.toggleClass;
    toggleClass = toggleClass ? toggleClass : "is-active";

    each(targets, (el) => {
      el.classList.toggle(toggleClass);
    });
  });

  addGAListeners();
  addSocialButtonListeners();
  addModal();

  try {
    import("../utils/enhancements.js").then((module) => {
      module.load();
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("could not load enhancements", e);
    document.body.classList.add("has-old-js")
  }
}

onLoad(createListeners);
