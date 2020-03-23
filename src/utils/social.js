import { each, on } from "./dom-utils.js";
import { sendGAEvent } from "./google-analytics.js";

export function addSocialButtonListeners() {
  on("click", '[data-share="tweet"]', (ev) => {
    let tweet = ev.currentTarget.dataset.shareText;
    let url = ev.currentTarget.dataset.shareUrl;
    url = url ? url : window.location.href;

    let twitterURL =
      "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent(tweet) +
      "&url=" +
      encodeURIComponent(url) +
      "&tw_p=tweetbutton";
    window.open(twitterURL, "_blank");
    sendGAEvent({
      eventCategory: "Share button interaction",
      eventAction: "Twitter share",
      eventLabel: url,
    });
  });

  on("click", '[data-share="facebook"]', (ev) => {
    let url = ev.currentTarget.dataset.shareUrl;
    url = url ? url : window.location.href;
    let facebookURL =
      "https://www.facebook.com/dialog/feed?app_id=589296315209793&display=page&link=" +
      encodeURIComponent(url);
    window.open(facebookURL, "_blank");
    sendGAEvent({
      eventCategory: "Share button interaction",
      eventAction: "Facebook share",
      eventLabel: url,
    });
  });

  on("click", '[data-share="sharesheet"]', (ev) => {
    let title =
      ev.currentTarget.dataset.shareTitle ??
      document.querySelector("[itemprop='name']")?.content ??
      document.title;
    let text =
      ev.currentTarget.dataset.shareText ??
      document.querySelector("[itemprop='description']")?.content ??
      "";
    let url = ev.currentTarget.dataset.shareUrl ?? window.location.href;
    navigator
      .share({
        title,
        text,
        url,
      })
      .then(() =>
        sendGAEvent({
          eventCategory: "Share button interaction",
          eventAction: "Open share sheet",
          eventLabel: url,
        })
      )
      // Ignore errors caused by closing sheet
      .catch(() => null);
  });

  if ("share" in navigator) {
    each('[data-share="sharesheet"]', (el) => el.classList.remove("is-hidden"));
  }
}
