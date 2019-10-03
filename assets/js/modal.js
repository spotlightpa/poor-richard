import { on, loadDate, storeDate } from "./dom-utils.js";

export function openModal() {
  let modal = document.querySelector("#modal-newsletter");
  if (!modal) {
    return;
  }
  ga("send", "event", {
    eventCategory: "Modal interaction",
    eventAction: "Saw modal",
    nonInteraction: true
  });

  let root = document.body.parentElement;
  let closeBtn = modal.querySelectorAll("[aria-label=close]");
  let bg = modal.querySelectorAll(".modal-background");
  let inputs = modal.querySelectorAll("input");
  let form = modal.querySelectorAll("form");

  modal.classList.add("is-active");
  root.classList.add("is-clipped");
  const ESCkeyCode = 27;

  let cancelFns = [
    on("click", closeBtn, closeModal),
    on("click", bg, closeModal),
    on("touchmove", bg, e => {
      e.preventDefault();
    }),
    on("keydown", document, e => {
      if (e.keyCode === ESCkeyCode) {
        closeModal();
      }
    }),
    on("focus", inputs, e => {
      ga("send", "event", {
        eventCategory: "Modal interaction",
        eventAction: "Focus input"
      });
    }),
    on("submit", form, e => {
      ga("send", "event", {
        eventCategory: "Modal interaction",
        eventAction: "Sign up for newsletter",
        transport: "beacon"
      });
    })
  ];

  function closeModal() {
    modal.classList.remove("is-active");
    root.classList.remove("is-clipped");
    cancelFns.forEach(fn => {
      fn();
    });
    ga("send", "event", {
      eventCategory: "Modal interaction",
      eventAction: "Dismiss modal",
      nonInteraction: true
    });
  }
}

export function addModal() {
  let cancelOpen = on("scroll", [window], () => {
    cancelOpen();
    const LAST_VISIT_KEY = "last-visit";
    const SAW_NEWSLETTER_MODAL_KEY = "saw-newsletter-modal";
    const FROM_MC_KEY = "originated-from-mailchimp";
    const delay = 5000; // 5s

    let now = new Date();
    let showModal = true;

    storeDate(LAST_VISIT_KEY, now);

    // If we're not already on the newsletter page...
    if (window.location.pathname.match(/newsletters/)) {
      storeDate(SAW_NEWSLETTER_MODAL_KEY, now);
    }
    // And haven't seen the modal recently...
    if (loadDate(SAW_NEWSLETTER_MODAL_KEY)) {
      showModal = false;
    }
    // And didn't come from the newsletter...
    if (window.location.href.match(/utm_source=email/)) {
      storeDate(FROM_MC_KEY, now);
    }
    if (document.referrer.match(/campaign-archive/)) {
      storeDate(FROM_MC_KEY, now);
    }
    if (loadDate(FROM_MC_KEY)) {
      showModal = false;
    }
    // And it's not excluded from the page
    if (document.body.dataset.modalExclude) {
      showModal = false;
    }
    // Or we're just testing...
    if (window.location.href.match(/debug-modal/)) {
      showModal = true;
    }
    // Then show it...
    if (showModal) {
      storeDate(SAW_NEWSLETTER_MODAL_KEY, now);
      window.setTimeout(openModal, delay);
    }
  });
}
