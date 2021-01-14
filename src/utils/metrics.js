import { loadDate, storeDate } from "../utils/dom-utils.js";

export const onTestPage = !!window.location.href.match(/debug/);
const onTestNewsletterPage = !!window.location.href.match(/debug=newsletter/);
const onTestDonatePage = !!window.location.href.match(/debug=donate/);

const LAST_VISIT_KEY = "last-visit";
const SAW_NEWSLETTER_MODAL_KEY = "saw-newsletter-modal";
const FROM_MC_KEY = "originated-from-mailchimp";
const SAW_DONATE_MODAL_KEY = "saw-donate-modal-totebag";
const SIGNED_UP_FOR_NEWSLETTER_KEY = "signed-up-for-newsletter";

let now = new Date();
export let showModalNewsletter = true;
export let showModalDonate = true;

let lastVist = loadDate(LAST_VISIT_KEY);
let lastSession = loadDate(LAST_VISIT_KEY, { useSession: true });

// It's a "new" session if there is a last visit but the session is new
// and it's been more than an hour since the last visit
// (not just opening articles new tabs)
// eslint-disable-next-line no-unused-vars
let newSession = lastVist && !lastSession && now - lastVist > 1000 * 60 * 60;

storeDate(LAST_VISIT_KEY, now);
storeDate(LAST_VISIT_KEY, now, { useSession: true });
// If we're on the donate page now, don't show donate screen later
if (window.location.pathname.match(/donate/)) {
  storeDate(SAW_DONATE_MODAL_KEY, now);
}

// If we're not already on the newsletter page...
if (window.location.pathname.match(/newsletters/)) {
  storeDate(SAW_NEWSLETTER_MODAL_KEY, now);
}
// And haven't seen the newsletter modal recently...
let sawNLModalOn = loadDate(SAW_NEWSLETTER_MODAL_KEY);
let SHOW_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 1 week
if (sawNLModalOn && now - sawNLModalOn < SHOW_INTERVAL) {
  showModalNewsletter = false;
}
if (loadDate(SAW_DONATE_MODAL_KEY)) {
  showModalDonate = false;
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
// And didn't previously sign up
if (loadDate(SIGNED_UP_FOR_NEWSLETTER_KEY)) {
  showModalNewsletter = false;
}
// Or we're just testing...
if (onTestNewsletterPage) {
  showModalNewsletter = true;
}
if (onTestDonatePage) {
  showModalNewsletter = false;
  showModalDonate = true;
}

export function sawModalNewsletter() {
  storeDate(SAW_NEWSLETTER_MODAL_KEY, now);
}

export function sawModalDonate() {
  storeDate(SAW_DONATE_MODAL_KEY, now);
}

document.documentElement.addEventListener("x-form-submit", ({ detail }) => {
  if (detail.match(/newsletters.*submit/)) {
    storeDate(SIGNED_UP_FOR_NEWSLETTER_KEY, now);
  }
});
