import { loadDate, storeDate } from "../utils/dom-utils.js";
import { sendGAEvent } from "../utils/google-analytics.js";

export default function modal() {
  const onTestPage = !!window.location.href.match(/debug/);
  const onTestNewsletterPage = !!window.location.href.match(/debug=newsletter/);
  const onTestDonatePage = !!window.location.href.match(/debug=donate/);

  const LAST_VISIT_KEY = "last-visit";
  const SAW_NEWSLETTER_MODAL_KEY = "saw-newsletter-modal";
  const FROM_MC_KEY = "originated-from-mailchimp";
  const SAW_DONATE_MODAL_KEY = "saw-donate-modal";

  const delay = onTestPage ? 500 : 2000; // 2s

  let now = new Date();
  let showModalNewsletter = true;

  let lastVist = loadDate(LAST_VISIT_KEY);
  let lastSession = loadDate(LAST_VISIT_KEY, { useSession: true });

  // It's a "new" session if there is a last visit but the session is new
  // and it's been more than an hour since the last visit
  // (not just opening articles new tabs)
  // eslint-disable-next-line no-unused-vars
  let newSession = lastVist && !lastSession && now - lastVist > 1000 * 60 * 60;

  storeDate(LAST_VISIT_KEY, now);
  storeDate(LAST_VISIT_KEY, now, { useSession: true });

  return {
    oldFocus: null,
    isOpen: false,

    get modalClass() {
      return this.isOpen ? "is-active" : "";
    },

    init() {
      // If we're on the donate page now, don't show donate screen later
      if (window.location.pathname.match(/donate/)) {
        storeDate(SAW_DONATE_MODAL_KEY, now);
      }

      // If we're not already on the newsletter page...
      if (window.location.pathname.match(/newsletters/)) {
        storeDate(SAW_NEWSLETTER_MODAL_KEY, now);
      }
      // And haven't seen the newsletter modal recently...
      if (loadDate(SAW_NEWSLETTER_MODAL_KEY)) {
        showModalNewsletter = false;
      }
      // And didn't come from the newsletter...
      if (window.location.href.match(/utm_source=email/)) {
        storeDate(FROM_MC_KEY, now);
      }
      if (document.referrer.match(/campaign-archive/)) {
        storeDate(FROM_MC_KEY, now);
      }
      if (loadDate(FROM_MC_KEY)) {
        showModalNewsletter = false;
      }
      // Or we're just testing...
      if (onTestNewsletterPage) {
        showModalNewsletter = true;
      }
      if (onTestDonatePage) {
        showModalNewsletter = false;
      }
      // Then show it...
      if (showModalNewsletter) {
        window.setTimeout(() => {
          storeDate(SAW_NEWSLETTER_MODAL_KEY, now);
          this.show();
        }, delay);
      }
    },

    show() {
      this.isOpen = true;

      document.body.parentElement.classList.add("is-clipped");

      sendGAEvent({
        eventCategory: "Modal interaction",
        eventAction: `Saw modal newsletter`,
        nonInteraction: true,
      });

      this.oldFocus = document.activeElement;
      window.setTimeout(() => {
        this.$refs.content.focus();
      }, 500);
    },

    focus() {
      sendGAEvent({
        eventCategory: "Modal interaction",
        eventAction: "Focus input",
      });
    },

    submit() {
      sendGAEvent({
        eventCategory: "Modal interaction",
        eventAction: `Submit newsletter`,
        transport: "beacon",
      });
    },

    close() {
      this.oldFocus.focus();
      document.body.parentElement.classList.remove("is-clipped");

      this.isOpen = false;
      sendGAEvent({
        eventCategory: "Modal interaction",
        eventAction: `Dismiss modal newsletter`,
      });
    },
  };
}
