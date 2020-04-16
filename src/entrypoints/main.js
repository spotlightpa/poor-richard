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

  if ("fetch" in window) {
    import("../utils/read-more.js").then((module) => {
      module.load();
    });
  }
}

onLoad(createListeners);
