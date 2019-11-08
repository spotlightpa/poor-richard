import { on, once, transition, loadDate, storeDate } from "./dom-utils.js";

export function openModal(qs) {
  let modal = document.querySelector(qs);
  if (!modal) {
    return;
  }
  window.ga("send", "event", {
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
  transition(modal, "fade-enter", "fade-enter-active", 500);
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
    // eslint-disable-next-line no-unused-vars
    on("focus", inputs, e => {
      window.ga("send", "event", {
        eventCategory: "Modal interaction",
        eventAction: "Focus input"
      });
    }),
    // eslint-disable-next-line no-unused-vars
    on("submit", form, e => {
      window.ga("send", "event", {
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
    window.ga("send", "event", {
      eventCategory: "Modal interaction",
      eventAction: "Dismiss modal",
      nonInteraction: true
    });
  }
}

export function addModal() {
  const onTestPage = !!window.location.href.match(/debug/);
  const onTestNewsletterPage = !!window.location.href.match(/debug=newsletter/);
  const onTestDonatePage = !!window.location.href.match(/debug=donate/);

  const LAST_VISIT_KEY = "last-visit";
  const SAW_NEWSLETTER_MODAL_KEY = "saw-newsletter-modal";
  const FROM_MC_KEY = "originated-from-mailchimp";
  const SAW_DONATE_MODAL_KEY = "saw-donate-modal";

  const delay = onTestPage ? 500 : 2000; // 2s

  let now = new Date();
  let showModalNewsletter = true;
  let showModalDonate = false;

  let lastVist = loadDate(LAST_VISIT_KEY);
  let lastSession = loadDate(LAST_VISIT_KEY, { useSession: true });

  // It's a "new" session if there is a last visit but the session is new
  // and it's been more than an hour since the last visit
  // (not just opening articles new tabs)
  let newSession = lastVist && !lastSession && now - lastVist > 1000 * 60 * 60;

  storeDate(LAST_VISIT_KEY, now);
  storeDate(LAST_VISIT_KEY, now, { useSession: true });

  once("scroll", [window], () => {
    // If we're on the donate page now, don't show donate screen later
    if (window.location.pathname.match(/donate/)) {
      storeDate(SAW_DONATE_MODAL_KEY, now);
    }

    // If we're not already on the newsletter page...
    if (window.location.pathname.match(/newsletters/)) {
      storeDate(SAW_NEWSLETTER_MODAL_KEY, now);
    }
    // And haven't seen the newsletter modal recently...
    if (loadDate(SAW_NEWSLETTER_MODAL_KEY)) {
      showModalNewsletter = false;
    }
    // And didn't come from the newsletter...
    if (window.location.href.match(/utm_source=email/)) {
      storeDate(FROM_MC_KEY, now);
    }
    if (document.referrer.match(/campaign-archive/)) {
      storeDate(FROM_MC_KEY, now);
    }
    if (loadDate(FROM_MC_KEY)) {
      showModalNewsletter = false;
    }
    // And it's not excluded from the page
    if (document.body.dataset.modalExclude) {
      showModalNewsletter = false;
    }
    // Or we're just testing...
    if (onTestNewsletterPage) {
      showModalNewsletter = true;
    }
    // Then show it...
    if (showModalNewsletter) {
      window.setTimeout(() => {
        storeDate(SAW_NEWSLETTER_MODAL_KEY, now);
        openModal("#modal-newsletter");
      }, delay);
      return;
    }

    // Otherwise, if it's a new session
    if (newSession) {
      showModalDonate = true;
    }
    // And we haven't seen the donate modal recently...
    if (loadDate(SAW_DONATE_MODAL_KEY)) {
      showModalDonate = false;
    }

    // And it's not excluded from the page
    if (document.body.dataset.modalExclude) {
      showModalDonate = false;
    }
    // Or we're just testing...
    if (onTestDonatePage) {
      showModalDonate = true;
    }
    // Then show it...
    if (showModalDonate) {
      window.setTimeout(() => {
        storeDate(SAW_DONATE_MODAL_KEY, now);
        openModal("#modal-donate");
      }, delay);
      return;
    }
  });
}
