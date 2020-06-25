"use strict";

(function () {
  function each(qs, cb) {
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

  function on(ev, qs, cb) {
    var cancelFns = [];
    each(qs, function (el) {
      el.addEventListener(ev, cb);
      cancelFns.push(function () {
        el.removeEventListener(ev, cb);
      });
    });
    return function () {
      cancelFns.forEach(function (fn) {
        fn();
      });
    };
  }

  function storeItem(name, obj) {
    var _ref =
        arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$useSession = _ref.useSession,
      useSession = _ref$useSession === void 0 ? false : _ref$useSession;

    var store = useSession ? window.sessionStorage : window.localStorage;
    var data = JSON.stringify(obj);
    store.setItem(name, data);
  }

  function loadItem(name) {
    var _ref2 =
        arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref2$useSession = _ref2.useSession,
      useSession = _ref2$useSession === void 0 ? false : _ref2$useSession;

    var store = useSession ? window.sessionStorage : window.localStorage;
    var data = store.getItem(name);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  }

  function storeDate(name, date) {
    var _ref3 =
        arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref3$useSession = _ref3.useSession,
      useSession = _ref3$useSession === void 0 ? false : _ref3$useSession;

    var data = +date;
    storeItem(name, data, {
      useSession: useSession,
    });
  }

  function loadDate(name) {
    var _ref4 =
        arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref4$useSession = _ref4.useSession,
      useSession = _ref4$useSession === void 0 ? false : _ref4$useSession;

    var date = loadItem(name, {
      useSession: useSession,
    });

    if (!date) {
      return null;
    }

    return new Date(date);
  }

  function polyfillClosest() {
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

  function onLoad(cb) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", cb);
    } else {
      cb();
    }
  }

  var DO_NOT_TRACK_KEY = "do-not-track";
  var dnt = loadItem(DO_NOT_TRACK_KEY);

  function callGA() {
    var _window;

    for (
      var _len = arguments.length, args = new Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      args[_key] = arguments[_key];
    }

    if (dnt) {
      // eslint-disable-next-line no-console
      console.info("GA", JSON.stringify(args));
      return;
    }

    (_window = window).ga.apply(_window, args);
  }

  function sendGAEvent(ev) {
    callGA("send", "event", ev);
  }

  function ensureGA() {
    var hasGA = Array.from(document.scripts).find(function (el) {
      return el.src.match(/google-analytics/);
    });

    if (hasGA) {
      return;
    }

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.google-analytics.com/analytics.js";
    document.body.appendChild(s);
  }

  function addGAListeners() {
    polyfillClosest();
    var onDNTPage = !!window.location.href.match(/debug=do-not-track/);

    if (onDNTPage) {
      storeItem(DO_NOT_TRACK_KEY, true);
    }

    each("a", function (el) {
      var isInternal =
        el.host === window.location.host || el.host.match(/spotlightpa\.org$/); // Open external links in new window

      if (!isInternal) {
        el.target = "_blank";
        el.rel = "noopener noreferrer";
      }

      on("click", el, function (ev) {
        var gaEvent = ev.currentTarget.dataset.gaEvent;

        if (gaEvent) {
          gaEvent = JSON.parse(gaEvent);
          sendGAEvent(gaEvent);
          return;
        }

        var eventCategory = isInternal ? "Internal Link" : "Outbound Link";
        var eventAction = "click";
        var parentAction = el.closest("[data-ga-action]");

        if (parentAction) {
          eventAction = parentAction.dataset.gaAction;
        }

        sendGAEvent({
          eventCategory: eventCategory,
          eventAction: eventAction,
          eventLabel: ev.currentTarget.href,
          transport: "beacon",
        });
      });
    });
    on("submit", "[data-ga-form]", function (ev) {
      var form = ev.target;
      var isValid = form.reportValidity();
      var gaEvent = JSON.parse(ev.currentTarget.dataset.gaForm);
      gaEvent.transport = "beacon";
      gaEvent.eventLabel = isValid ? "submit" : "invalid submission";
      sendGAEvent(gaEvent);
    });
  }

  var onTestPage = !!window.location.href.match(/debug/);
  var onTestNewsletterPage = !!window.location.href.match(/debug=newsletter/);
  var onTestDonatePage = !!window.location.href.match(/debug=donate/);
  var LAST_VISIT_KEY = "last-visit";
  var SAW_NEWSLETTER_MODAL_KEY = "saw-newsletter-modal";
  var FROM_MC_KEY = "originated-from-mailchimp";
  var SAW_DONATE_MODAL_KEY = "saw-donate-modal";
  var now = new Date();
  var showModalNewsletter = true;
  var lastVist = loadDate(LAST_VISIT_KEY);
  var lastSession = loadDate(LAST_VISIT_KEY, {
    useSession: true,
  }); // It's a "new" session if there is a last visit but the session is new
  // and it's been more than an hour since the last visit
  // (not just opening articles new tabs)
  // eslint-disable-next-line no-unused-vars

  var newSession = lastVist && !lastSession && now - lastVist > 1000 * 60 * 60;
  storeDate(LAST_VISIT_KEY, now);
  storeDate(LAST_VISIT_KEY, now, {
    useSession: true,
  }); // If we're on the donate page now, don't show donate screen later

  if (window.location.pathname.match(/donate/)) {
    storeDate(SAW_DONATE_MODAL_KEY, now);
  } // If we're not already on the newsletter page...

  if (window.location.pathname.match(/newsletters/)) {
    storeDate(SAW_NEWSLETTER_MODAL_KEY, now);
  } // And haven't seen the newsletter modal recently...

  if (loadDate(SAW_NEWSLETTER_MODAL_KEY)) {
    showModalNewsletter = false;
  } // And didn't come from the newsletter...

  if (window.location.href.match(/utm_source=email/)) {
    storeDate(FROM_MC_KEY, now);
  }

  if (document.referrer.match(/campaign-archive/)) {
    storeDate(FROM_MC_KEY, now);
  }

  if (loadDate(FROM_MC_KEY)) {
    showModalNewsletter = false;
  } // Or we're just testing...

  if (onTestNewsletterPage) {
    showModalNewsletter = true;
  }

  if (onTestDonatePage) {
    showModalNewsletter = false;
  }

  function sawModalNewsletter() {
    storeDate(SAW_NEWSLETTER_MODAL_KEY, now);
  } // Ensure a Google Analytics window func

  if (!window.ga) {
    window.ga = function () {
      (window.ga.q = window.ga.q || []).push(arguments);
    };

    window.ga.l = +new Date();
  }

  onLoad(addGAListeners);
})();
