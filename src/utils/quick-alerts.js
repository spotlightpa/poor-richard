const STORE_KEY = "alerts-quick-subs";
const busy = new Set();

function readStore() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    const now = Date.now();
    const fresh = {};
    let changed = false;
    Object.entries(raw).forEach(([id, v]) => {
      if (v && v.token && v.exp > now) {
        fresh[id] = v;
      } else {
        changed = true;
      }
    });
    if (changed) writeStore(fresh);
    return fresh;
  } catch {
    return {};
  }
}

function writeStore(store) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    return;
  }
}

function tokenExpiry(token) {
  try {
    const [encoded] = token.split(".");
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64)).x || 0;
  } catch {
    return 0;
  }
}

export function rememberedContact() {
  try {
    const email = localStorage.getItem("alerts-remembered-email") || "";
    const phone = localStorage.getItem("alerts-remembered-phone") || "";
    return email || phone ? { email, phone } : null;
  } catch {
    return null;
  }
}

export function markAdded(facilityId, undoToken) {
  if (!facilityId || !undoToken) return;
  const store = readStore();
  store[facilityId] = {
    token: undoToken,
    exp: tokenExpiry(undoToken),
  };
  writeStore(store);
  applyAlertStates();
}

function isAdded(facilityId) {
  return !!readStore()[facilityId];
}

function setState(btn, state) {
  btn.dataset.alertState = state;
  if (state === "adding" || state === "removing") {
    btn.setAttribute("aria-busy", "true");
  } else {
    btn.removeAttribute("aria-busy");
  }
  btn.querySelectorAll("[data-alert-label]").forEach((el) => {
    el.hidden = el.dataset.alertLabel !== state;
  });
}

export function applyAlertStates(root = document) {
  const store = readStore();
  root.querySelectorAll("[data-alert-facility]").forEach((btn) => {
    if (
      ["removed", "already", "adding", "removing"].includes(
        btn.dataset.alertState,
      )
    )
      return;
    setState(btn, store[btn.dataset.alertFacility] ? "added" : "default");
  });
}

function setStateForFacility(facilityId, state) {
  document
    .querySelectorAll(`[data-alert-facility="${CSS.escape(facilityId)}"]`)
    .forEach((btn) => setState(btn, state));
}

export function alertButtonContent({ label, iconClass = "h-4 w-4" }) {
  return `<span data-alert-label="default" class="inline-flex items-center gap-1.5"><svg class="${iconClass} flex-shrink-0 fill-current" aria-hidden="true"><use href="#bell-svg" /></svg><span>${label}</span></span><span data-alert-label="added" class="inline-flex items-center gap-1.5" hidden><svg class="${iconClass} flex-shrink-0 fill-current" aria-hidden="true"><use href="#circle-check-svg" /></svg><span>Added</span></span><span data-alert-label="removed" class="inline-flex items-center gap-1.5" hidden><span>Removed</span></span><span data-alert-label="adding" class="inline-flex items-center gap-1.5" hidden><svg class="${iconClass} flex-shrink-0 animate-spin fill-current" aria-hidden="true"><use href="#circle-notch-svg" /></svg><span>Adding</span></span><span data-alert-label="removing" class="inline-flex items-center gap-1.5" hidden><svg class="${iconClass} flex-shrink-0 animate-spin fill-current" aria-hidden="true"><use href="#circle-notch-svg" /></svg><span>Removing</span></span><span data-alert-label="already" class="inline-flex items-center gap-1.5" hidden><svg class="${iconClass} flex-shrink-0 fill-current" aria-hidden="true"><use href="#circle-check-svg" /></svg><span>Already added</span></span>`;
}

export const ALERT_STATE_CLASSES =
  "data-[alert-state=added]:border-election-green-lighter data-[alert-state=added]:bg-election-green-lightest data-[alert-state=added]:text-election-green-darkest data-[alert-state=added]:hover:bg-election-green-lighter data-[alert-state=removed]:border-g-3 data-[alert-state=removed]:bg-g-2 data-[alert-state=removed]:text-g-8 data-[alert-state=already]:border-election-green-lighter data-[alert-state=already]:bg-election-green-lightest data-[alert-state=already]:text-election-green-darkest data-[alert-state=removing]:border-election-green-lighter data-[alert-state=removing]:bg-election-green-lightest data-[alert-state=removing]:text-election-green-darkest aria-busy:cursor-wait";

export async function quickToggleAlert({
  facilityId,
  facilityName,
  facilityAddress,
}) {
  const contact = rememberedContact();
  if (!contact || !facilityId) return false;
  if (busy.has(facilityId)) return true;
  busy.add(facilityId);

  const wasAdded = isAdded(facilityId);
  setStateForFacility(facilityId, wasAdded ? "removing" : "adding");

  try {
    if (wasAdded) {
      const entry = readStore()[facilityId];
      const res = await fetch("/.netlify/functions/undo-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ undoToken: entry.token }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        window.alert(data.error || "Something went wrong. Please try again.");
        return true;
      }
      const store = readStore();
      delete store[facilityId];
      writeStore(store);
      setStateForFacility(facilityId, "removed");
      setTimeout(() => setStateForFacility(facilityId, "default"), 1800);
      return true;
    }

    const res = await fetch("/.netlify/functions/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: contact.email,
        phone: contact.phone,
        method: "email",
        facilityId,
        facilityName,
        facilityAddress,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 409 && data.alreadySubscribed) {
      setStateForFacility(facilityId, "already");
      setTimeout(() => setStateForFacility(facilityId, "default"), 2000);
      return true;
    }
    if (!res.ok) {
      window.alert(data.error || "Something went wrong. Please try again.");
      return true;
    }
    setStateForFacility(facilityId, "added");
    markAdded(facilityId, data.undoToken);
    return true;
  } catch {
    window.alert("Something went wrong. Please try again.");
    return true;
  } finally {
    busy.delete(facilityId);
    const added = isAdded(facilityId);
    document
      .querySelectorAll(`[data-alert-facility="${CSS.escape(facilityId)}"]`)
      .forEach((btn) => {
        if (["adding", "removing"].includes(btn.dataset.alertState)) {
          setState(btn, added ? "added" : "default");
        }
      });
  }
}
