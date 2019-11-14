import { on } from "./dom-utils.js";
import { sendGAEvent } from "./google-analytics.js";

export function addSocialButtonListeners() {
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
    sendGAEvent({
      eventCategory: "Share button interaction",
      eventAction: "Twitter share",
      eventLabel: url
    });
  });

  on("click", '[data-share="facebook"]', ev => {
    var url = ev.currentTarget.dataset.shareUrl;
    url = url ? url : window.location.href;
    var facebookURL =
      "https://www.facebook.com/dialog/feed?app_id=589296315209793&display=page&link=" +
      encodeURIComponent(url);
    window.open(facebookURL, "_blank");
    sendGAEvent({
      eventCategory: "Share button interaction",
      eventAction: "Facebook share",
      eventLabel: url
    });
  });
}
