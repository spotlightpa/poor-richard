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
  each(qs, el => {
    el.addEventListener(ev, cb);
  });
}
