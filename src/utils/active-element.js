let oldFoci = [];

export function focus(el) {
  if (document.activeElement) {
    oldFoci.push(document.activeElement);
  }
  el.focus();
}

export function blur(el) {
  el.blur();
  let oldFocus = oldFoci.pop();
  if (oldFocus) {
    oldFocus.focus();
  }
}
