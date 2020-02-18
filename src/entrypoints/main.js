import { each, on, onLoad } from "../utils/dom-utils.js";
import { addModal } from "../utils/modal.js";
import { addSocialButtonListeners } from "../utils/social.js";
import { addGAListeners } from "../utils/google-analytics.js";
import { rotatePromoImages } from "../utils/promo.js";
import { addScrollListener } from "../utils/scrolly.js";

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
  addScrollListener();
  rotatePromoImages();
}

onLoad(createListeners);
