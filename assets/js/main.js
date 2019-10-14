import { each, on } from "./dom-utils.js";
import { addModal } from "./modal.js";
import { addSocialButtonListeners } from "./social.js";

function createListeners() {
  // Ensure a Google Analytics func
  if (!window.ga) {
    window.ga = function() {
      (window.ga.q = window.ga.q || []).push(arguments);
    };
    window.ga.l = +new Date();
  }

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
    // eslint-disable-next-line no-unused-vars
    on("click", el, e => {
      window.ga("send", "event", {
        eventCategory: "Outbound Link",
        eventAction: "click",
        eventLabel: event.target.href,
        transport: "beacon"
      });
    });
  });

  addSocialButtonListeners();
  addModal();
}

on("DOMContentLoaded", document, createListeners);
