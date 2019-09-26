import { on, loadDate, storeDate } from "./dom-utils.js";

export function openModal() {
  let modal = document.querySelector("#modal-newsletter");
  if (!modal) {
    return;
  }
  let root = document.body.parentElement;
  let closeBtn = modal.querySelectorAll("[aria-label=close]");
  let bg = modal.querySelectorAll(".modal-background");

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
    })
  ];

  function closeModal() {
    modal.classList.remove("is-active");
    root.classList.remove("is-clipped");
    cancelFns.forEach(fn => {
      fn();
    });
  }
}

export function addModal() {
  let cancelOpen = on("scroll", [window], () => {
    cancelOpen();
    const LAST_VISIT_KEY = "last-visit";
    const SAW_NEWSLETTER_MODAL_KEY = "saw-newsletter-modal";
    const FROM_MC_KEY = "originated-from-mailchimp";
    const delay = 2000; // 2s

    let now = new Date();
    let showModal = false;

    // If this is our second+ page seen...
    if (loadDate(LAST_VISIT_KEY)) {
      showModal = true;
    }
    storeDate(LAST_VISIT_KEY, now);

    // And we're not already on the newsletter page...
    if (window.location.pathname.match(/newsletters/)) {
      storeDate(SAW_NEWSLETTER_MODAL_KEY, now);
    }
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
