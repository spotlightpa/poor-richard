import Alpine from "alpinejs/src/index.js";

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
  for (let [name, comp] of [
    ["embed-list", embedList],
    ["feed", feed],
    ["funnel-status", funnelStatus],
    ["image-rotator", imageRotator],
    ["intersector", intersector],
    ["lightbox", lightbox],
    ["modal", modal],
    ["most-popular", mostPopular],
    ["readmore", readmore],
    ["search-articles", searchArticles],
    ["search-modal", searchModal],
    ["slider", slider],
    ["sticky", sticky],
  ]) {
    Alpine.data(name, comp);
  }

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
  Alpine.magic("attrs", (el) => {
    let o = {};
    for (let [name, val] of Object.entries(el.dataset)) {
      if (name.startsWith("!")) {
        name = name.substring(1);
        val = val === "true" || val === "1" || val === name;
      } else if (name.startsWith("@")) {
        name = name.substring(1);
        val = val.split(",").map((s) => s.trim());
      }
      o[name] = val;
    }
    return o;
  });
});

Alpine.start();
