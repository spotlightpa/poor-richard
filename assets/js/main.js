function each(qs, cb) {
  if (typeof qs === "string") {
    qs = document.querySelectorAll(qs);
  }
  if (!qs) {
    return;
  }
  if (qs.length === undefined) {
    qs = [qs];
  }
  for (var i = 0; i < qs.length; i++) {
    cb(qs[i], i);
  }
}

function on(ev, qs, cb) {
  each(qs, (el) => {
    el.addEventListener(ev, cb);
  });
}

function createListeners() {
  on("click", "[data-target]", (ev)=> {
    var targets = ev.currentTarget.dataset.target;
    var toggleClass = ev.currentTarget.dataset.toggleClass;
    toggleClass = toggleClass ? toggleClass : "is-active";

    each(targets, (el) => {
      el.classList.toggle(toggleClass);
    });
  });

  // Open external links in new window
  each("a[href^=http]", (el) => {
    if (el.host === window.location.host) {
      return;
    }
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  });

  on("click", '[data-share="tweet"]', (ev)=> {
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

  on("click", '[data-share="facebook"]', (ev)=> {
    var url = ev.currentTarget.dataset.shareUrl;
    url = url ? url : window.location.href;
    var facebookURL =
      "https://www.facebook.com/dialog/feed?app_id=2352768061509311&display=page&link=" +
      encodeURIComponent(url);
    window.open(facebookURL, "_blank");
  });
}

on("DOMContentLoaded", document, createListeners);
