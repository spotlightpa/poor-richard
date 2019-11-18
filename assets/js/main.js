import { each, on } from "./dom-utils.js";
import { addModal } from "./modal.js";
import { addSocialButtonListeners } from "./social.js";
import { addGAListeners } from "./google-analytics.js";
import { rotatePromoImages } from "./promo.js";

function createListeners() {
  on("click", "[data-target]", ev => {
    var targets = ev.currentTarget.dataset.target;
    var toggleClass = ev.currentTarget.dataset.toggleClass;
    toggleClass = toggleClass ? toggleClass : "is-active";

    each(targets, el => {
      el.classList.toggle(toggleClass);
    });
  });

  addGAListeners();
  addSocialButtonListeners();
  addModal();
  rotatePromoImages();
}

on("DOMContentLoaded", document, createListeners);
