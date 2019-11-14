import { each, on } from "./dom-utils.js";
import { addModal } from "./modal.js";
import { addSocialButtonListeners } from "./social.js";
import { sendGAEvent } from "./google-analytics.js";

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

    on("click", el, ev => {
      sendGAEvent({
        eventCategory: "Outbound Link",
        eventAction: "click",
        eventLabel: ev.currentTarget.href,
        transport: "beacon"
      });
    });
  });

  on("click", "[data-ga-event]", ev => {
    let { gaEvent } = ev.currentTarget.dataset;
    if (!gaEvent) {
      return;
    }
    gaEvent = JSON.parse(gaEvent);
    sendGAEvent(gaEvent);
  });

  addSocialButtonListeners();
  addModal();
}

on("DOMContentLoaded", document, createListeners);
