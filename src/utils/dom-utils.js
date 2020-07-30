export function each(qs, cb) {
  if (typeof qs === "string") {
    qs = document.querySelectorAll(qs);
  }
  if (!qs) {
    return;
  }
  if (qs.length === undefined) {
    qs = [qs];
  }
  for (var i = 0; i < qs.length; i++) {
    cb(qs[i], i);
  }
}

export function on(ev, qs, cb) {
  let cancelFns = [];

  each(qs, (el) => {
    el.addEventListener(ev, cb);
    cancelFns.push(() => {
      el.removeEventListener(ev, cb);
    });
  });
  return () => {
    cancelFns.forEach((fn) => {
      fn();
    });
  };
}

export function once(ev, qs, cb) {
  let cancelFn = on(ev, qs, (...args) => {
    cancelFn();
    cb(...args);
  });
}

export function storeItem(name, obj, { useSession = false } = {}) {
  let store = useSession ? window.sessionStorage : window.localStorage;
  let data = JSON.stringify(obj);
  store.setItem(name, data);
}

export function loadItem(name, { useSession = false } = {}) {
  let store = useSession ? window.sessionStorage : window.localStorage;
  let data = store.getItem(name);
  if (!data) {
    return null;
  }
  return JSON.parse(data);
}

export function storeDate(name, date, { useSession = false } = {}) {
  let data = +date;
  storeItem(name, data, { useSession });
}

export function loadDate(name, { useSession = false } = {}) {
  let date = loadItem(name, { useSession });
  if (!date) {
    return null;
  }
  return new Date(date);
}

export function polyfillClosest() {
  // Source: https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector;
  }

  if (!Element.prototype.closest) {
    Element.prototype.closest = function (s) {
      var el = this;

      do {
        if (el.matches(s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }
}

export function onLoad(cb) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cb);
  } else {
    cb();
  }
}

export function allClosest(el, qs) {
  // in case of programmatic error or weirdo DOM tree
  const maxDepth = 1000;
  let els = [];
  let i;
  for (i = 0; i < maxDepth; i++) {
    el = el.closest(qs);
    if (!el) break;
    els.push(el);
    el = el.parentElement;
    if (!el) break;
  }
  if (i === maxDepth) {
    throw Error(`allClosest exceeded maxDepth of ${maxDepth}`);
  }
  els.reverse();
  return els;
}
