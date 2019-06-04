function each(qs, cb) {
  if (typeof qs === "string") {
    qs = document.querySelectorAll(qs);
  }
  for (var i = 0; i < qs.length; i++) {
    cb(qs[i], i);
  }
}

function on(ev, qs, cb) {
  each(qs, function(el) {
    el.addEventListener(ev, cb);
  });
}

on("click", "[data-target]", function(ev) {
  var targets = ev.currentTarget.getAttribute("data-target");
  var toggleClass = ev.currentTarget.getAttribute("data-toggle-class");
  toggleClass = toggleClass ? toggleClass : "is-active";
  if (targets) {
    each(targets, function(el) {
      el.classList.toggle(toggleClass);
    });
  }
});
