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
  el.classList.add(clsName);
  // IE11 has broken classList.add
  el.classList.add(clsNameActive);
  window.setTimeout(() => {
    el.classList.remove(clsName);
    window.setTimeout(() => {
      el.classList.remove(clsNameActive);
    }, 0);
  }, 0);
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
