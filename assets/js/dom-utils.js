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

  each(qs, el => {
    el.addEventListener(ev, cb);
    cancelFns.push(() => {
      el.removeEventListener(ev, cb);
    });
  });
  return () => {
    cancelFns.forEach(fn => {
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

export function transition(el, clsName, clsNameActive) {
  el.classList.add(clsName, clsNameActive);
  window.setTimeout(() => {
    el.classList.remove(clsName);
    window.setTimeout(() => {
      el.classList.remove(clsNameActive);
    }, 0);
  }, 0);
}

export function storeItem(name, obj) {
  let data = JSON.stringify(obj);
  window.localStorage.setItem(name, data);
}

export function loadItem(name) {
  let data = window.localStorage.getItem(name);
  if (!data) {
    return null;
  }
  return JSON.parse(data);
}

export function storeDate(name, date) {
  let data = +date;
  storeItem(name, data);
}

export function loadDate(name) {
  let date = loadItem(name);
  if (!date) {
    return null;
  }
  return new Date(date);
}
