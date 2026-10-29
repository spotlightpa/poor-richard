import Alpine from "alpinejs/src/index.js";
import {
  escapeHTML,
  parseInspectionDate,
  generateInspectionCardId,
  normalizeString,
  simplifyAddress,
} from "../utils/inspections.js";
import { scrollToStickyTop, stickyOffset } from "../utils/sticky-scroll.js";
import {
  alertButtonContent,
  applyAlertStates,
  quickToggleAlert,
  ALERT_STATE_CLASSES,
} from "../utils/quick-alerts.js";

const DETAIL_SCROLL = [
  "md:max-h-[calc(100vh-73px-var(--tracker-bar-h,0px))]",
  "md:overflow-y-auto",
];

let suggestIndex = null;
let suggestIndexSize = -1;

function getSuggestIndex() {
  const all = Alpine.raw(Alpine.store("inspections").allData) || [];
  if (suggestIndex && suggestIndexSize === all.length) return suggestIndex;
  const seen = new Map();
  all.forEach((row) => {
    if (!row.id || !row.facility) return;
    const id = generateInspectionCardId(row.id);
    if (seen.has(id)) return;
    seen.set(id, {
      id,
      name: row.facility,
      detail: simplifyAddress(row.address || "") || row.city || "",
      key: normalizeString(row.facility),
      haystack: normalizeString(
        [row.facility, row.address, row.city].filter(Boolean).join(" "),
      ),
    });
  });
  suggestIndex = Array.from(seen.values());
  suggestIndexSize = all.length;
  return suggestIndex;
}

window.addEventListener("inspections-data-ready", () => {
  const build = () => getSuggestIndex();
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(build, { timeout: 2000 });
  } else {
    setTimeout(build, 200);
  }
});

function findSuggestions(rawQuery) {
  const q = normalizeString(rawQuery || "");
  if (q.length < 2) return [];
  const terms = q.split(" ").filter(Boolean);
  const cities = (Alpine.raw(Alpine.store("inspections").cities) || [])
    .filter((c) => normalizeString(c.text).startsWith(q))
    .slice(0, 3)
    .map((c) => ({
      type: "city",
      id: "city:" + c.value,
      name: c.text,
      detail: c.count
        ? `${c.count.toLocaleString()} ${c.count === 1 ? "facility" : "facilities"}`
        : "",
    }));
  const limit = 6 - Math.min(cities.length, 2);
  const starts = [];
  const contains = [];
  for (const f of getSuggestIndex()) {
    if (!terms.every((t) => f.haystack.includes(t))) continue;
    if (f.key.startsWith(q)) {
      starts.push(f);
      if (starts.length >= limit) break;
    } else if (contains.length < limit) {
      contains.push(f);
    }
  }
  const facilities = starts
    .concat(contains)
    .slice(0, limit)
    .map((f) => ({
      type: "facility",
      id: f.id,
      name: f.name,
      detail: f.detail,
    }));
  return cities.concat(facilities);
}

export function searchUI() {
  return {
    loadingLocation: false,
    q: "",
    suggestOpen: false,
    activeIndex: -1,
    uid: Math.random().toString(36).slice(2, 8),
    suggestions: [],
    suggestTimer: null,

    refreshSuggestions() {
      this.suggestions = findSuggestions(this.q);
    },

    onSuggestInput() {
      this.activeIndex = -1;
      const ready = (this.q || "").trim().length >= 2;
      clearTimeout(this.suggestTimer);
      if (!ready) {
        this.suggestions = [];
        this.suggestOpen = false;
        return;
      }
      this.suggestTimer = setTimeout(() => {
        this.refreshSuggestions();
        this.suggestOpen = true;
      }, 90);
    },

    moveSuggest(step) {
      const n = this.suggestions.length;
      if (!n) return;
      this.suggestOpen = true;
      this.activeIndex = (this.activeIndex + step + n) % n;
    },

    onSuggestEnter() {
      const s = this.suggestions[this.activeIndex];
      if (this.suggestOpen && s) {
        this.chooseSuggestion(s);
      } else {
        this.closeSuggest();
        this.doSearch();
        if (window.innerWidth < 850) this.$refs.input?.blur();
      }
    },

    closeSuggest() {
      clearTimeout(this.suggestTimer);
      this.suggestOpen = false;
      this.activeIndex = -1;
    },

    chooseSuggestion(s) {
      this.closeSuggest();
      const store = Alpine.store("inspections");
      if (s.type === "city") {
        this.q = "";
        store.searchQuery = "";
        store.currentCity = s.name;
        if (window.innerWidth < 850) this.$refs.input?.blur();
        return;
      }
      store.currentCity = "";
      store.currentPriority = "";
      window.dispatchEvent(new CustomEvent("inspections-show-list"));
      if (window.innerWidth < 850) this.$refs.input?.blur();
      let opened = false;
      const openCard = () => {
        if (opened) return;
        const card = Array.from(
          document.querySelectorAll('[data-card="inspection"]'),
        ).find(
          (c) =>
            c.offsetParent &&
            c.querySelector(`[data-alert-facility="${CSS.escape(s.id)}"]`),
        );
        const btn = card?.querySelector("[data-read-more]");
        if (!btn) return;
        opened = true;
        btn.click();
      };
      window.addEventListener("inspections-page-rendered", openCard, {
        once: true,
      });
      this.doSearch(s.name);
      setTimeout(openCard, 400);
    },

    init() {
      this.q = Alpine.store("inspections").searchQuery || "";

      window.addEventListener("inspections-clear-search", () => {
        this.q = "";
      });

      window.addEventListener("inspections-locate", (e) => {
        if (e.detail?.scope !== this.$el.dataset.searchScope) return;
        this.locate();
      });

      this.$watch("loadingLocation", (loading) => {
        window.dispatchEvent(
          new CustomEvent("inspections-locating", {
            detail: { scope: this.$el.dataset.searchScope, loading },
          }),
        );
      });

      window.addEventListener("inspections-apply-search", (event) => {
        this.q = event.detail?.value || "";
      });

      this.$watch("$store.inspections.searchQuery", (value) => {
        if ((this.q || "").trim() !== (value || "")) this.q = value || "";
      });
    },

    doSearch(val) {
      if (typeof val === "string") {
        this.q = val;
      }

      if (document.querySelector(".detail-content")) {
        window.dispatchEvent(new CustomEvent("inspections-back-to-results"));
      }

      Alpine.store("inspections").searchQuery = this.q.trim();
    },

    async locate() {
      if (!("geolocation" in navigator)) {
        alert("Geolocation isn't supported in this browser.");
        return;
      }
      this.loadingLocation = true;
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude: lat, longitude: lon } = pos.coords;
            const res = await fetch(
              `https://viz-sample-ballot-2024.data.spotlightpa.org/api/geolocate?latlng=${encodeURIComponent(lat)},${encodeURIComponent(lon)}`,
            );
            if (!res.ok) throw new Error("Reverse geocode failed");
            const data = await res.json();
            if (data.status !== "OK" || !data.results?.length)
              throw new Error("No results");
            const components = data.results[0].address_components || [];
            let city = "",
              zip = "",
              state = "";
            for (const c of components) {
              if (!city && c.types.includes("locality")) city = c.long_name;
              if (!zip && c.types.includes("postal_code")) zip = c.short_name;
              if (!state && c.types.includes("administrative_area_level_1"))
                state = c.short_name;
            }
            if (!city) {
              for (const c of components) {
                if (
                  c.types.includes("sublocality") ||
                  c.types.includes("administrative_area_level_3")
                ) {
                  city = c.long_name;
                  break;
                }
              }
            }
            if (state !== "PA") {
              alert(
                "This tool covers Pennsylvania only. Your location appears to be outside PA.",
              );
              this.loadingLocation = false;
              return;
            }
            const locationString = [city.trim(), zip.trim()]
              .filter(Boolean)
              .join(" ");
            if (locationString) {
              this.q = locationString;
              this.doSearch();
            } else {
              alert("Couldn't determine your city/ZIP from location.");
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            alert("Sorry, we couldn't look up your city/ZIP.");
          } finally {
            this.loadingLocation = false;
          }
        },
        (err) => {
          // eslint-disable-next-line no-console
          console.warn(err);
          if (err.code === err.PERMISSION_DENIED) {
            alert("We need permission to use your location.");
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            alert("Location unavailable. Try again.");
          } else if (err.code === err.TIMEOUT) {
            alert("Timed out getting your location. Try again.");
          } else {
            alert("Couldn't get your location. Please try again.");
          }
          this.loadingLocation = false;
        },
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 },
      );
    },
  };
}

let inspectionsUIDelegatesInitialized = false;
let inspectionsUIDataReadyInitialized = false;
let inspectionsUIHashInitialized = false;

export default function inspectionsUI() {
  return {
    activeCard: null,
    lastReadMoreButton: null,
    initializedDelegates: false,

    get store() {
      return Alpine.store("inspections");
    },

    get currentSort() {
      return this.store.currentSort;
    },
    set currentSort(val) {
      this.store.currentSort = val;
    },

    get currentCity() {
      return this.store.currentCity;
    },
    set currentCity(val) {
      this.store.currentCity = val;
    },

    get searchQuery() {
      return this.store.searchQuery;
    },
    set searchQuery(val) {
      this.store.searchQuery = val;
    },

    get totalResults() {
      return this.store.filteredData.length;
    },

    get hasResults() {
      return this.store.filteredData.length > 0;
    },

    init() {
      window.addEventListener("inspections-back-to-results", () => {
        this.backToResults();
      });

      let realignTimer;
      window.addEventListener("resize", () => {
        clearTimeout(realignTimer);
        realignTimer = setTimeout(() => this.realignDetail(), 150);
      });

      window
        .matchMedia("(min-width: 850px)")
        .addEventListener("change", () =>
          requestAnimationFrame(() => this.syncDetailToViewport()),
        );

      if (!inspectionsUIDelegatesInitialized) {
        document.addEventListener("click", (e) => {
          const readMoreBtn = e.target.closest(
            'button[aria-label="Read more about this inspection"]',
          );
          if (readMoreBtn) {
            e.preventDefault();
            const card = readMoreBtn.closest('[data-card="inspection"]');
            if (card) {
              this.lastReadMoreButton = readMoreBtn;
              this.openDetails(card);
            }
            return;
          }
          const shareBtn = e.target.closest('[data-action="detail-share"]');
          if (!e.target.closest("[data-share-root]")) this.closeShareMenus();
          if (shareBtn) {
            e.preventDefault();
            this.openShare(shareBtn);
            return;
          }
          const copyBtn = e.target.closest('[data-action="copy-link"]');
          if (copyBtn) {
            e.preventDefault();
            this.copyShareLink(copyBtn);
            return;
          }
          if (e.target.closest("[data-share-menu] a")) {
            this.closeShareMenus();
          }
          const detailAlertsBtn = e.target.closest(
            '[data-action="detail-alerts"]',
          );
          if (detailAlertsBtn) {
            e.preventDefault();
            this.requestAlerts({
              facilityName: detailAlertsBtn.dataset.facilityName || "",
              facilityAddress: detailAlertsBtn.dataset.facilityAddress || "",
              facilityId: detailAlertsBtn.dataset.alertFacility || "",
            });
            return;
          }
          const alertsBtn = e.target.closest('[data-action="card-alerts"]');
          if (alertsBtn) {
            e.preventDefault();
            const card = alertsBtn.closest('[data-card="inspection"]');
            if (card) this.openCardAlerts(card);
            return;
          }
          const backBtn = e.target.closest('[data-action="back-to-results"]');
          if (backBtn) {
            e.preventDefault();
            this.backToResults();
            return;
          }
        });
        document.addEventListener("keydown", (e) => {
          if (e.key !== "Escape") return;
          const open = document.querySelector(
            "[data-share-menu]:not([hidden])",
          );
          if (!open) return;
          this.closeShareMenus();
          open.parentElement
            .querySelector('[data-action="detail-share"]')
            ?.focus();
        });
        inspectionsUIDelegatesInitialized = true;
      }

      if (!inspectionsUIHashInitialized) {
        inspectionsUIHashInitialized = true;
        window.addEventListener("hashchange", () => {
          if (window.location.hash) return;
          if (!document.querySelector(".detail-content")) return;
          window.dispatchEvent(new CustomEvent("inspections-back-to-results"));
        });
      }

      if (!inspectionsUIDataReadyInitialized) {
        inspectionsUIDataReadyInitialized = true;
        window.addEventListener("inspections-data-ready", () => {
          setTimeout(() => this.checkHashAndOpenCard(), 200);
        });
      }
    },

    clearAll() {
      this.store.searchQuery = "";
      this.store.currentCity = "";
      this.store.currentPriority = "";
      this.store.currentSort = "date-desc";
      localStorage.removeItem("inspections-sort");
      window.dispatchEvent(new CustomEvent("inspections-clear-search"));
    },

    generateCardId(card) {
      const firstInspection =
        JSON.parse(card.getAttribute("data-all-inspections") || "[]")[0] || {};
      if (firstInspection.id) {
        return generateInspectionCardId(firstInspection.id);
      }
      const title = (card.querySelector("h2")?.textContent || "").trim();
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    },

    checkHashAndOpenCard() {
      if (window.innerWidth < 850) return;
      const hash = window.location.hash.slice(1);
      const qParam =
        new URLSearchParams(window.location.search).get("facility") || "";
      const target = hash || qParam;
      if (!target) return;
      const cards = Array.from(
        document.querySelectorAll('[data-card="inspection"]'),
      );
      const card = cards.find((c) => this.generateCardId(c) === target);
      if (card) setTimeout(() => this.openDetails(card), 200);
    },

    scrollToListTop(el) {
      scrollToStickyTop(el);
    },

    cardLocation(card) {
      return (
        card.querySelector('.list-content [data-field="address"]')
          ?.textContent || ""
      ).trim();
    },

    openCardAlerts(card) {
      const title = (card.querySelector("h2")?.textContent || "").trim();
      this.requestAlerts({
        facilityName: title,
        facilityAddress: this.cardLocation(card),
        facilityId: this.generateCardId(card),
      });
    },

    closeShareMenus() {
      document.querySelectorAll("[data-share-menu]").forEach((menu) => {
        if (menu.hidden) return;
        menu.hidden = true;
        menu.parentElement
          .querySelector('[data-action="detail-share"]')
          ?.setAttribute("aria-expanded", "false");
      });
    },

    async openShare(btn) {
      const url = btn.dataset.shareUrl;
      const title = btn.dataset.shareTitle;
      const coarse = window.matchMedia?.("(pointer: coarse)").matches;
      if (navigator.share && coarse) {
        try {
          await navigator.share({ title, url });
        } catch {
          return;
        }
        return;
      }
      const menu = btn.parentElement.querySelector("[data-share-menu]");
      if (!menu) return;
      const willOpen = menu.hidden;
      this.closeShareMenus();
      if (willOpen) {
        menu.hidden = false;
        btn.setAttribute("aria-expanded", "true");
        menu.querySelector('[role="menuitem"]')?.focus();
      }
    },

    async copyShareLink(btn) {
      const original = btn.getAttribute("aria-label") || "Copy link";
      let message = "Link copied!";
      try {
        await navigator.clipboard.writeText(btn.dataset.shareUrl);
      } catch {
        message = "Couldn't copy";
      }
      btn.setAttribute("aria-label", message);
      btn.setAttribute("title", message);
      btn.dataset.copied = "true";
      setTimeout(() => {
        btn.setAttribute("aria-label", original);
        btn.setAttribute("title", original);
        delete btn.dataset.copied;
      }, 1500);
    },

    async requestAlerts(detail) {
      if (await quickToggleAlert(detail)) return;
      window.dispatchEvent(new CustomEvent("open-alerts-modal", { detail }));
    },

    jsStringAttr(s) {
      return JSON.stringify(String(s ?? "")).replace(/"/g, "&quot;");
    },

    openDetails(card) {
      document
        .querySelectorAll(".pagination-controls")
        .forEach((el) => el.classList.add("hidden"));
      document.getElementById("search-results-banner")?.classList.add("hidden");

      const lat = parseFloat(card.getAttribute("data-lat"));
      const lon = parseFloat(card.getAttribute("data-lon"));
      if (!isNaN(lat) && !isNaN(lon)) {
        window.dispatchEvent(
          new CustomEvent("map:zoomToMarker", { detail: { lat, lon } }),
        );
      }

      const allCards = Array.from(
        document.querySelectorAll('[data-card="inspection"]'),
      );
      allCards.forEach((c) => {
        if (c !== card) c.classList.add("hidden-by-detail");
        else c.classList.remove("hidden-by-detail");
        this.syncHidden(c);
      });

      const listContent = card.querySelector(".list-content");
      let detail = card.querySelector(".detail-content");
      if (!detail) {
        detail = document.createElement("div");
        detail.className = "detail-content";
        card.appendChild(detail);
      }

      const title = (card.querySelector("h2")?.textContent || "").trim();
      const location = this.cardLocation(card);
      const allInspections = JSON.parse(
        card.getAttribute("data-all-inspections") || "[]",
      );
      const latestViolations = this.readViolations(card);
      const latestItems =
        latestViolations.map((v) => this.renderViolationItem(v)).join("") ||
        `<li class="space-y-2"><div class="flex items-start pt-3 gap-2"><svg class="mt-1 h-5 w-5 fill-current stroke-current" style="color: #1b998b;" aria-hidden="true"><use href="#circle-check-svg" /></svg><h4 class="font-sans text-lg font-bold text-black flex flex-wrap items-center gap-1">No violations reported.</h4></div></li>`;

      detail.innerHTML = this.buildDetailHTML({
        title,
        location,
        card,
        latestViolations,
        latestItems,
        olderInspectionsHTML: this.renderOlderInspections(allInspections),
      });
      applyAlertStates(detail);

      if (listContent) listContent.classList.add("hidden");

      const mount = card.closest(".inspections-mount");
      if (mount) {
        mount.classList.add("h-full", "flex", "flex-col");
        mount.classList.remove("space-y-3");
      }
      card.classList.add(
        "h-full",
        "flex",
        "flex-col",
        "flex-1",
        ...DETAIL_SCROLL,
      );
      detail.classList.add("flex", "flex-col", "flex-1");

      detail
        .querySelector('[data-action="back-to-results"]')
        ?.focus({ preventScroll: true });

      const container = mount
        ? mount.closest(".border-r") || mount.parentElement
        : null;
      if (container) this.scrollToListTop(container);

      this.activeCard = card;
      const hasQParam = new URLSearchParams(window.location.search).get(
        "facility",
      );
      if (!hasQParam) {
        window.location.hash = this.generateCardId(card);
      }
      document.getElementById("no-results")?.classList.add("hidden");
    },

    backToResults() {
      window.dispatchEvent(new CustomEvent("map:restoreView"));
      window.dispatchEvent(
        new CustomEvent("update-map-markers", {
          detail: { markers: Alpine.store("inspections").markers },
        }),
      );
      document
        .querySelectorAll(".pagination-controls")
        .forEach((el) => el.classList.remove("hidden"));

      if (!this.activeCard) {
        window.dispatchEvent(new CustomEvent("inspections-refresh-search-ui"));
        return;
      }
      const card = this.activeCard;
      card.classList.remove(...DETAIL_SCROLL);
      card.scrollTop = 0;
      card.querySelector(".detail-content")?.remove();
      card.querySelector(".list-content")?.classList.remove("hidden");

      const allCards = Array.from(
        document.querySelectorAll('[data-card="inspection"]'),
      );
      allCards.forEach((c) => {
        c.classList.remove("hidden-by-detail");
        this.syncHidden(c);
      });

      const mount = card.closest(".inspections-mount");
      if (mount) {
        mount.classList.remove("h-full", "flex", "flex-col");
        mount.classList.add("space-y-3");
      }
      card.classList.remove("h-full", "flex", "flex-col", "flex-1");
      this.lastReadMoreButton?.focus({ preventScroll: true });

      this.activeCard = null;
      history.replaceState(null, "", window.location.pathname);

      const container = mount
        ? mount.closest(".border-r") || mount.parentElement
        : null;
      if (container) this.scrollToListTop(container);

      Alpine.store("inspections").currentPage;
      window.dispatchEvent(new CustomEvent("inspections-render-pagination"));
      window.dispatchEvent(new CustomEvent("inspections-refresh-search-ui"));
    },

    releaseDetail(card) {
      card.classList.remove(
        ...DETAIL_SCROLL,
        "h-full",
        "flex",
        "flex-col",
        "flex-1",
      );
      card.scrollTop = 0;
      card.querySelector(".detail-content")?.remove();
      card.querySelector(".list-content")?.classList.remove("hidden");
      const mount = card.closest(".inspections-mount");
      if (mount) {
        mount.classList.remove("h-full", "flex", "flex-col");
        mount.classList.add("space-y-3");
      }
    },

    realignDetail() {
      const detail = Array.from(
        document.querySelectorAll(".detail-content"),
      ).find((el) => el.offsetParent !== null);
      const card = detail?.closest('[data-card="inspection"]');
      if (!card) return;
      const top = card.getBoundingClientRect().top;
      if (top >= stickyOffset() - 1 || top < -card.offsetHeight / 2) return;
      const mount = card.closest(".inspections-mount");
      scrollToStickyTop(mount.closest(".border-r") || mount.parentElement);
    },

    syncDetailToViewport() {
      const card = document
        .querySelector(".detail-content")
        ?.closest('[data-card="inspection"]');
      if (!card) return;
      const mobile = window.innerWidth < 850;
      const mount = Array.from(
        document.querySelectorAll(".inspections-mount"),
      ).find((m) => !!m.closest("[data-mobile-tracker]") === mobile);
      if (!mount || mount.contains(card)) return;
      const target = mount.querySelector(`#${CSS.escape(card.id)}`);
      this.releaseDetail(card);
      if (!target) {
        this.backToResults();
        return;
      }
      if (mobile) {
        window.dispatchEvent(new CustomEvent("inspections-show-list"));
      }
      this.openDetails(target);
    },

    syncHidden(card) {
      const hide =
        card.classList.contains("hidden-by-search") ||
        card.classList.contains("hidden-by-city") ||
        card.classList.contains("hidden-by-detail");
      card.classList.toggle("hidden", hide);
    },

    renderOlderInspections(allInspections) {
      if (allInspections.length <= 1) return "";
      const byDate = {};
      allInspections.slice(1).forEach((inspection) => {
        const date = inspection.inspection_date || "";
        if (!byDate[date]) byDate[date] = [];
        byDate[date].push(inspection);
      });
      const dates = Object.keys(byDate).sort(
        (a, b) => parseInspectionDate(b) - parseInspectionDate(a),
      );
      const rows = dates
        .map((date) => {
          const inspections = byDate[date];
          const allDescriptions = [];
          const allComments = [];
          inspections.forEach((insp) => {
            const desc = (insp.violation_description || "").trim();
            const comm = (insp.comment || "").trim();
            const ai = (insp.ai_summary || "").trim();
            if (desc) {
              desc.split(" | ").forEach((d) => {
                if (d.trim()) allDescriptions.push(d.trim());
              });
              const commParts = comm.split(" | ");
              const aiParts = ai.split(" | ");
              commParts.forEach((c, i) => {
                allComments.push((aiParts[i] || "").trim() || c.trim());
              });
            }
          });
          const violationCount = allDescriptions.length;
          if (!violationCount) {
            return `<div class="bg-white border-2 border-g-3 rounded-lg p-4"><div class="flex flex-wrap items-center justify-between gap-2"><div class="flex items-center gap-3 min-w-0"><svg class="h-5 w-5 flex-shrink-0 fill-g-6" aria-hidden="true"><use href="#calendar-day-svg" /></svg><span class="font-sans text-base font-bold text-g-9 whitespace-nowrap">${escapeHTML(date)}</span></div><span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold" style="background-color: #e8f5f3; color: #1b998b;"><svg class="h-4 w-4 fill-current" aria-hidden="true"><use href="#circle-check-svg" /></svg>No violations</span></div></div>`;
          }
          const violationRows = allDescriptions
            .map(
              (desc, i) =>
                `<li class="pb-4 mb-4 border-b border-g-3 last:border-b-0 last:pb-0 last:mb-0"><h4 class="font-sans text-base font-bold text-g-9 mb-2">${escapeHTML(desc)}</h4>${allComments[i] ? `<p class="font-serif text-sm leading-relaxed text-g-7 border-l-2 border-g-4 pl-3">${escapeHTML(allComments[i])}</p>` : ""}</li>`,
            )
            .join("");
          return `<details class="group bg-white border-2 border-g-3 rounded-lg overflow-hidden"><summary class="relative flex items-start p-4 pr-10 cursor-pointer hover:bg-g-1 transition-colors"><div class="flex flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-2 min-w-0"><div class="flex items-center gap-2 min-w-0"><svg class="h-5 w-5 flex-shrink-0 fill-g-6" aria-hidden="true"><use href="#calendar-day-svg" /></svg><span class="font-sans text-base font-bold text-g-9">${escapeHTML(date)}</span></div><span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-1 text-sm font-semibold text-red-7"><svg class="h-4 w-4 fill-current" aria-hidden="true"><use href="#diamond-svg" /></svg>${violationCount} violation${violationCount !== 1 ? "s" : ""}</span></div><svg class="absolute right-4 top-4 h-5 w-5 flex-shrink-0 fill-g-6 transition-transform group-open:rotate-180" aria-hidden="true"><use href="#chevron-svg" /></svg></summary><div class="border-t border-g-3 p-4 bg-g-1"><ul class="space-y-4">${violationRows}</ul></div></details>`;
        })
        .join("");
      return `<div class="mt-8 pt-8 border-t-2 border-g-3"><h3 class="text-xl font-bold text-g-9 mb-6">Other inspections (${dates.length})</h3><div class="space-y-4">${rows}</div></div>`;
    },

    buildDetailHTML({
      title,
      location,
      card,
      latestViolations,
      latestItems,
      olderInspectionsHTML,
    }) {
      const hasAi = latestViolations.some((v) =>
        (v.aiSummary || "").trim().replace(/^[\s|]+$/, ""),
      );
      const firstInspection =
        JSON.parse(card.getAttribute("data-all-inspections") || "[]")[0] || {};
      const cardId = firstInspection.id
        ? generateInspectionCardId(firstInspection.id)
        : this.generateCardId(card);
      const facilityUrl =
        window.location.origin +
        window.location.pathname +
        "?facility=" +
        cardId;
      return `<div>
        <button type="button" class="inline-flex items-center font-sans font-bold text-navy hover:text-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-g-5 rounded" data-action="back-to-results" aria-label="Back to results">
          <svg class="h-5 w-5 flex-shrink-0 fill-current" aria-hidden="true"><use href="#chevron-left-svg" /></svg>
          <span class="ml-1.5">Back</span>
        </button>
        <div class="flex items-start justify-between gap-6 py-4 pr-4 sm:pr-6">
          <div class="min-w-0 flex-1">
            <h2 class="text-3xl font-bold text-black break-words">${escapeHTML(title)}</h2>
            ${location ? `<div class="mt-2 space-y-1 text-g-6"><div class="flex items-center gap-1"><svg class="h-4 w-4 flex-shrink-0 fill-g-7" aria-hidden="true"><use href="#map-pin-svg" /></svg><span>${escapeHTML(location)}</span></div></div>` : ""}
            <div class="mt-4 flex flex-wrap items-center gap-2">
              <button type="button" data-action="detail-alerts" data-alert-facility="${escapeHTML(cardId)}" data-facility-name="${escapeHTML(title)}" data-facility-address="${escapeHTML(location)}" class="inline-flex h-11 items-center justify-center rounded-xl border-2 border-transparent bg-blue-2/80 px-6 font-sans text-sm font-semibold text-blue-9 transition-colors outline-none hover:bg-blue-2 ${ALERT_STATE_CLASSES} focus-visible:ring-2 focus-visible:ring-blue/30 focus-visible:outline-none">${alertButtonContent({ label: "Get alerts" })}</button>
              <a href="mailto:?subject=${encodeURIComponent("Inspection report: " + title)}&body=${encodeURIComponent(facilityUrl)}" class="flex h-11 w-11 items-center justify-center rounded-full bg-g-3 text-g-9 transition-colors hover:bg-g-4 focus-visible:ring-2 focus-visible:ring-g-5 focus-visible:outline-none" aria-label="Share via email"><svg class="h-5 w-5 fill-current" aria-hidden="true"><use href="#envelope-svg" /></svg></a>
              <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(facilityUrl)}" target="_blank" rel="noopener" class="flex h-11 w-11 items-center justify-center rounded-full bg-g-3 text-g-9 transition-colors hover:bg-g-4 focus-visible:ring-2 focus-visible:ring-g-5 focus-visible:outline-none" aria-label="Share on Facebook"><svg class="h-5 w-5 fill-current" aria-hidden="true"><use href="#fb-svg" /></svg></a>
              <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(facilityUrl)}&text=${encodeURIComponent("Inspection report: " + title)}" target="_blank" rel="noopener" class="flex h-11 w-11 items-center justify-center rounded-full bg-g-3 text-g-9 transition-colors hover:bg-g-4 focus-visible:ring-2 focus-visible:ring-g-5 focus-visible:outline-none" aria-label="Share on X"><svg class="h-5 w-5 fill-current" aria-hidden="true"><use href="#twitter-svg" /></svg></a>
              <button type="button" data-action="copy-link" data-share-url="${escapeHTML(facilityUrl)}" class="flex h-11 w-11 items-center justify-center rounded-full bg-orange/20 text-[#d9541f] transition-colors hover:bg-orange/30 focus-visible:ring-2 focus-visible:ring-orange/40 focus-visible:outline-none data-[copied=true]:bg-election-green-lightest data-[copied=true]:text-election-green-darkest" aria-label="Copy link" title="Copy link"><svg class="h-5 w-5 fill-current" aria-hidden="true"><use href="#share-svg" /></svg></button>
            </div>
          </div>
        </div>
        <section class="space-y-3">
          <h3 class="text-xl font-bold text-g-9 mb-3">Latest inspection</h3>
          <p class="text-sm font-sans italic text-g-5 mb-3">As noted by the Department of Agriculture, inspections are a &ldquo;snapshot&rdquo; of a particular day. Many violations are relatively minor and are fixed at the time of inspection.</p>
          ${hasAi ? `<div class="mb-3 flex items-start gap-2"><svg class="mt-0.5 h-5 w-5 flex-shrink-0 fill-current text-g-4" aria-hidden="true"><use href="#robot-svg" /></svg><p class="text-sm font-sans italic text-g-5">AI-generated summaries are provided to make inspector comments easier to understand.</p></div>` : ""}
          <ul class="space-y-3">${latestItems}</ul>
          ${hasAi ? `<p class="mt-4 text-sm font-sans italic text-g-5">While we strive for accuracy, AI may occasionally misinterpret technical language. Always refer to the full inspection report (linked below) for complete details.</p>` : ""}
        </section>
        ${olderInspectionsHTML}
        <div class="pt-5">
          <a href="https://www.pafoodsafety.pa.gov/web/inspection/publicinspectionsearch.aspx" class="group inline-flex items-center gap-2 font-sans font-semibold text-navy hover:text-blue">
            <svg class="h-5 w-5 flex-shrink-0 fill-current group-hover:text-blue" aria-hidden="true"><use href="#link-svg" /></svg>
            <span>Search facility name here to see the full report</span>
          </a>
        </div>
      </div>`;
    },

    renderViolationItem(v) {
      const title = (v.title || "").trim();
      const aiSummary = (v.aiSummary || "").trim().replace(/^[\s|]+$/, "");
      const comment = (v.comment || "").trim().replace(/^[\s|]+$/, "");
      const displayComment = aiSummary || comment;
      const riskLevel = (v.riskLevel || "").toLowerCase();
      let color = "#6b7280";
      if (riskLevel.includes("high risk")) color = "#D70000";
      else if (riskLevel.includes("moderate risk")) color = "#FFCB03";
      else if (riskLevel.includes("low risk")) color = "#009EDB";
      return `<li class="space-y-2 pb-4 mb-4 border-b border-g-3 last:border-b-0 last:pb-0 last:mb-0"><div class="flex items-start pt-2 gap-2"><svg class="mt-1 h-5 w-5 fill-current stroke-current flex-shrink-0" style="color: ${color};" aria-hidden="true"><use href="#diamond-svg" /></svg><h4 class="font-sans text-lg font-bold text-black break-words">${escapeHTML(title)}</h4></div>${displayComment ? `<p class="font-serif leading-relaxed text-g-7 border-l-4 border-g-5 pl-4 ml-7">${escapeHTML(displayComment)}</p>` : ""}</li>`;
    },

    readViolations(card) {
      const violationDesc = (
        card.getAttribute("data-violation-description") || ""
      ).trim();
      const spotlightPa = (card.getAttribute("data-spotlight-pa") || "").trim();
      const violationComment = (
        card.getAttribute("data-violation-comment") || ""
      ).trim();
      if (!violationDesc && !spotlightPa && !violationComment) return [];

      const descriptions = violationDesc
        .split(" | ")
        .map((s) => s.trim())
        .filter(Boolean);
      const spotlights = spotlightPa.split(" | ").map((s) => s.trim());
      const comments = violationComment.split(" | ").map((s) => s.trim());
      const aiSummaries = (card.getAttribute("data-ai-summary") || "")
        .split(" | ")
        .map((s) => s.trim());
      const riskLevels = (card.getAttribute("data-risk-level") || "")
        .split(" | ")
        .map((s) => s.trim());

      const violations = [];
      for (
        let i = 0;
        i < Math.max(descriptions.length, spotlights.length, comments.length);
        i++
      ) {
        const title =
          spotlights[i] && spotlights[i] !== "NA" && spotlights[i] !== ""
            ? spotlights[i]
            : descriptions[i] || "Violation reported";
        violations.push({
          title,
          comment: comments[i] || "",
          aiSummary: aiSummaries[i] || "",
          riskLevel: riskLevels[i] || "",
          originalIndex: i,
        });
      }

      const priority = (r) => {
        const l = (r || "").toLowerCase();
        if (l.includes("high risk")) return 1;
        if (l.includes("moderate risk")) return 2;
        if (l.includes("low risk")) return 3;
        return 4;
      };
      violations.sort(
        (a, b) =>
          priority(a.riskLevel) - priority(b.riskLevel) ||
          a.originalIndex - b.originalIndex,
      );
      return violations;
    },
  };
}
