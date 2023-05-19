import { each, on, onLoad } from "./dom-utils.js";
import { addGAListeners } from "./google-analytics.js";

onLoad(() => {
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
});
