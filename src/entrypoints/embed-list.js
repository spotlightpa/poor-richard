import Vue from "vue";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faCopy);

Vue.component("font-awesome-icon", FontAwesomeIcon);

import EmbedListWrapper from "../components/EmbedListWrapper.vue";
import { each } from "../utils/dom-utils.js";

var EmbedListWrapperComp = Vue.extend(EmbedListWrapper);

each(".js-embed-list-item", el => {
  let data = JSON.parse(el.innerText);
  new EmbedListWrapperComp({
    propsData: { data }
  }).$mount(el);
});
