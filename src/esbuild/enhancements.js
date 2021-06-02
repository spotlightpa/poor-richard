import "alpinejs";
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

window.spl = Object.assign({}, window.spl, {
  embedList,
  feed,
  funnelStatus,
  imageRotator,
  intersector,
  lightbox,
  modal,
  mostPopular,
  readmore,
  sanitizeText,
  searchArticles,
  searchModal,
  slider,
  sticky,
});
