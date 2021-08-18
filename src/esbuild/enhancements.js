import Alpine from "alpinejs/src/index.js";

import "../utils/add-listeners.js";

import embedList from "../enhancements/embed-list.js";
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

for (let [name, comp] of [
  ["embed-list", embedList],
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

Alpine.directive(
  "template",
  (el, { expression }, { effect, evaluateLater }) => {
    let evalStr = expression
      ? "`" + expression + "`"
      : "`" + el.innerText.trim() + "`";
    let evaluate = evaluateLater(evalStr);

    effect(() => {
      evaluate((value) => {
        el.innerText = value;
      });
    });
  }
);

Alpine.magic("setAttrs", (el) => (target, obj) => {
  for (let [targetName, source] of Object.entries(obj)) {
    let val = el.dataset[source];
    if (source.startsWith("!")) {
      val = val === "true" || val === "1";
    } else if (source.startsWith("@")) {
      val = val.split(",").map((s) => s.trim());
    }
    target[targetName] = val;
  }
  return target;
});

Alpine.start();
