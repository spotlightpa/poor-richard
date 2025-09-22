import Alpine from "alpinejs/src/index.js";

import "../utils/add-listeners.js";
import { analyticsPlugin } from "../utils/google-analytics.js";

Alpine.plugin(analyticsPlugin);

import newsletterPlugin from "../enhancements/newsletter.js";

Alpine.plugin(newsletterPlugin);

import carousel from "../enhancements/carousel.js";
import embedList from "../enhancements/embed-list.js";
import funnelStatus from "../enhancements/funnel-status.js";
import imageRotator from "../enhancements/image-rotator.js";
import modal from "../enhancements/modal.js";
import mostPopular from "../enhancements/most-popular.js";
import prefill from "../enhancements/prefill.js";
import readmore from "../enhancements/read-more.js";
import sanitizeText from "../enhancements/sanitize-text.js";
import searchArticles from "../enhancements/search-articles.js";
import searchModal from "../enhancements/search-modal.js";
import slider from "../enhancements/slider.js";
import sticky from "../enhancements/sticky.js";
import takeover from "../enhancements/takeover.js";

for (let [name, comp] of [
  ["carousel", carousel],
  ["embedList", embedList],
  ["funnelStatus", funnelStatus],
  ["imageRotator", imageRotator],
  ["modal", modal],
  ["mostPopular", mostPopular],
  ["prefill", prefill],
  ["readmore", readmore],
  ["searchArticles", searchArticles],
  ["searchModal", searchModal],
  ["slider", slider],
  ["sticky", sticky],
  ["takeover", takeover],
]) {
  Alpine.data(name, comp);
}

import shareButton from "../enhancements/share-button.js";

Alpine.bind("shareButton", shareButton);

Alpine.directive(
  "rich-text",
  (el, { expression }, { evaluateLater, effect }) => {
    let getHtml = evaluateLater(expression);

    effect(() => {
      getHtml((html) => {
        el.innerHTML = sanitizeText(html);
      });
    });
  },
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
  },
);

import intersect from "@alpinejs/intersect";

Alpine.plugin(intersect);

import focus from "@alpinejs/focus";

Alpine.plugin(focus);

import collapse from "@alpinejs/collapse";

Alpine.plugin(collapse);

Alpine.start();
