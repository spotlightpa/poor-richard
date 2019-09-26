import { each, on } from "./dom-utils.js";
import { addModal } from "./modal.js";
import { addSocialButtonListeners } from "./social.js";

function createListeners() {
  on("click", "[data-target]", ev => {
    var targets = ev.currentTarget.dataset.target;
    var toggleClass = ev.currentTarget.dataset.toggleClass;
    toggleClass = toggleClass ? toggleClass : "is-active";

    each(targets, el => {
      el.classList.toggle(toggleClass);
    });
  });

  // Open external links in new window
  each("a[href^=http]", el => {
    if (el.host === window.location.host) {
      return;
    }
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  });

  addSocialButtonListeners();
  addModal();
}

on("DOMContentLoaded", document, createListeners);
