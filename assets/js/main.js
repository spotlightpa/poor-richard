import { each, on, loadDate, storeDate } from "./dom-utils.js";

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

  on("click", '[data-share="tweet"]', ev => {
    var tweet = ev.currentTarget.dataset.shareText;
    var url = ev.currentTarget.dataset.shareUrl;
    url = url ? url : window.location.href;

    var twitterURL =
      "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent(tweet) +
      "&url=" +
      encodeURIComponent(url) +
      "&tw_p=tweetbutton";
    window.open(twitterURL, "_blank");
  });

  on("click", '[data-share="facebook"]', ev => {
    var url = ev.currentTarget.dataset.shareUrl;
    url = url ? url : window.location.href;
    var facebookURL =
      "https://www.facebook.com/dialog/feed?app_id=2352768061509311&display=page&link=" +
      encodeURIComponent(url);
    window.open(facebookURL, "_blank");
  });

  function openModal() {
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

  let cancelOpen = on("scroll", [window], () => {
    cancelOpen();
    const SAW_NEWSLETTER_MODAL_KEY = "saw-newsletter-modal";
    const FROM_MC_KEY = "originated-from-mailchimp";
    let now = new Date();
    let showModal = true;

    if (loadDate(SAW_NEWSLETTER_MODAL_KEY)) {
      showModal = false;
    }
    if (window.location.href.match(/utm_source=email/)) {
      storeDate(FROM_MC_KEY, now);
    }
    if (loadDate(FROM_MC_KEY)) {
      showModal = false;
    }
    if (window.location.href.match(/debug-modal/)) {
      showModal = true;
    }
    if (showModal) {
      storeDate(SAW_NEWSLETTER_MODAL_KEY, now);
      window.setTimeout(openModal, 500);
    }
  });
}

on("DOMContentLoaded", document, createListeners);
