import Alpine from "alpinejs";

import "../utils/add-listeners.js";

import embedList from "../enhancements/embed-list.js";
import feed from "../enhancements/feed.js";
import funnelStatus from "../enhancements/funnel-status.js";
import imageRotator from "../enhancements/image-rotator.js";
import intersector from "../enhancements/intersector.js";
import lightbox from "../enhancements/lightbox.js";
import modal from "../enhancements/modal.js";
import mostPopular from "../enhancements/most-popular.js";
import readmore from "../enhancements/read-more.js";
import sanitizeText from "../enhancements/sanitize-text.js";
import searchArticles from "../enhancements/search-articles.js";
import searchModal from "../enhancements/search-modal.js";
import slider from "../enhancements/slider.js";
import sticky from "../enhancements/sticky.js";

document.addEventListener("alpine:initializing", () => {
  Alpine.data("embed-list", embedList);
  Alpine.data("feed", feed);
  Alpine.data("funnel-status", funnelStatus);
  Alpine.data("image-rotator", imageRotator);
  Alpine.data("intersector", intersector);
  Alpine.data("lightbox", lightbox);
  Alpine.data("modal", modal);
  Alpine.data("most-popular", mostPopular);
  Alpine.data("readmore", readmore);
  Alpine.data("search-articles", searchArticles);
  Alpine.data("search-modal", searchModal);
  Alpine.data("slider", slider);
  Alpine.data("sticky", sticky);
  Alpine.directive(
    "rich-text",
    (el, { expression }, { evaluateLater, effect }) => {
      let getHtml = evaluateLater(expression);

      effect(() => {
        getHtml((html) => {
          el.innerHTML = sanitizeText(html);
        });
      });
    }
  );
});

Alpine.start();
