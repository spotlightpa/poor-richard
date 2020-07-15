import "alpinejs";

import embedList from "../enhancements/embed-list.js";
import feed from "../enhancements/feed.js";
import intersector from "../enhancements/intersector.js";
import modal from "../enhancements/modal.js";
import mostPopular from "../enhancements/most-popular.js";
import readmore from "../enhancements/read-more.js";
import sticky from "../enhancements/sticky.js";
import searchArticles from "../enhancements/search-articles.js";

window.spl = Object.assign({}, window.spl, {
  embedList,
  feed,
  intersector,
  modal,
  mostPopular,
  readmore,
  searchArticles,
  sticky,
});
