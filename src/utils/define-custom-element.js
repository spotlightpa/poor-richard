import Vue from "vue";

export default function defineCustomElement({ tagName, component }) {
  if (!("customElements" in window)) {
    document.body.classList.add("has-old-js");
    return;
  }
  customElements.define(
    tagName,
    class CustomComponentElement extends HTMLElement {
      constructor() {
        super();
        new Vue(component).$mount(this);
      }
    }
  );
}
