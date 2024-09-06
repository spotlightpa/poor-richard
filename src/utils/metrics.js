import {
  loadItem,
  storeItem,
  loadDate,
  storeDate,
  pushItem,
} from "../utils/dom-utils.js";

const onTestNewsletterPage = !!window.location.href.match(/debug=newsletter/);

const LAST_VISIT_KEY = "last-visit";
const SAW_NEWSLETTER_MODAL_KEY = "saw-newsletter-modal";
const FROM_MC_KEY = "originated-from-mailchimp";
const SAW_DONATE_MODAL_KEY = "saw-donate-modal-totebag";
const SIGNED_UP_FOR_NEWSLETTER_KEY = "signed-up-for-newsletter";
const PRIOR_FUNNEL_STATUS_KEY = "funnel-status";
const SAW_TAKEOVER_MODAL_KEY = "saw-takeover-modal";

const SHOW_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 1 week
const TAKEOVER_INTERVAL = 10 * 60 * 1000; // 10 minutes

let now = new Date();

export const statusNewUser = 0,
  statusReturner = 1,
  statusSubscriber = 2,
  statusMember = 3;
export let funnelStatus = loadItem(PRIOR_FUNNEL_STATUS_KEY) || statusNewUser;

let lastVist = loadDate(LAST_VISIT_KEY);
let lastSession = loadDate(LAST_VISIT_KEY, { useSession: true });

// It's a "new" session if there is a last visit but the session is new
// and it's been more than an hour since the last visit
// (not just opening articles new tabs)
let newSession = lastVist && !lastSession && now - lastVist > 1000 * 60 * 60;

storeDate(LAST_VISIT_KEY, now);
storeDate(LAST_VISIT_KEY, now, { useSession: true });
// TODO: Figure out who is a donor now that donation is offsite
// If we're on the donate page now, don't show donate screen later
if (window.location.pathname.match(/donate/)) {
  storeDate(SAW_DONATE_MODAL_KEY, now);
  funnelStatus = statusMember;
}

if (newSession) {
  funnelStatus = Math.max(funnelStatus, statusReturner);
}

if (
  window.location.href.match(/utm_source=email/) ||
  document.referrer.match(/campaign-archive/)
) {
  storeDate(FROM_MC_KEY, now);
}
// And didn't previously sign up
if (loadDate(SIGNED_UP_FOR_NEWSLETTER_KEY)) {
  funnelStatus = Math.max(funnelStatus, statusSubscriber);
}

storeItem(PRIOR_FUNNEL_STATUS_KEY, funnelStatus);

let shouldShowModalNewsletter = (() => {
  // Does this page even have a newsletter to pop up?
  if (!document.querySelector("[data-modal-kind=newsletter]")) {
    return false;
  }
  if (onTestNewsletterPage) {
    return true;
  }
  // show new users the modal if they haven't seen it recently
  if (funnelStatus >= statusSubscriber) {
    return false;
  }
  let cameFromMCOn = loadDate(FROM_MC_KEY) || 0;
  let sawNLModalOn = loadDate(SAW_NEWSLETTER_MODAL_KEY) || 0;
  if (!cameFromMCOn && !sawNLModalOn) {
    return true;
  }
  let lastPrompt = Math.max(cameFromMCOn, sawNLModalOn);
  return now - lastPrompt > SHOW_INTERVAL;
})();

let shouldShowModalTakeover = (() => {
  // Does this page even have a takeover to pop up?
  if (!document.querySelector("[data-modal-kind=takeover]")) {
    return false;
  }
  if (onTestNewsletterPage) {
    return true;
  }
  let sawTakeoverModalOn = loadDate(SAW_TAKEOVER_MODAL_KEY) || 0;
  return now - sawTakeoverModalOn > TAKEOVER_INTERVAL;
})();

export let modalKind = (() => {
  if (window.matchMedia("(prefers-reduced-motion), (speech)").matches) {
    // eslint-disable-next-line no-console
    console.warn("prefers-reduced-motion; aborting modal display");
    return "none";
  }
  if (shouldShowModalTakeover) {
    return "takeover";
  }
  if (shouldShowModalNewsletter) {
    return "newsletter";
  }
  return "sticky";
})();

/*
- Is there a prior object? If not, load in the junk from before.
- Push this page
- Figure out what modals the page has
- Rank the modals and decide what to push

spl_user_hist is an Array of Events.
An Event is an object with

{
  k: Kind - pageview, click, submit, view
  t: Timestamp (+Date())
  v: Value (pageview:path, click:action, submit:kind, view:kind)
}
*/
let userHistory = loadItem("spl_user_history");

if (!userHistory) {
}

export function pushUserHistory({ kind, value }) {
  pushItem("spl_user_history", { k: kind, t: +now, v: value });
}

export function recordModalNewsletterView() {
  storeDate(SAW_NEWSLETTER_MODAL_KEY, now);
}

export function recordNewsletterSignup() {
  storeDate(SIGNED_UP_FOR_NEWSLETTER_KEY, now);
}
export function recordModalTakeoverView() {
  storeDate(SAW_TAKEOVER_MODAL_KEY, now);
}
