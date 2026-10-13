import Alpine from "alpinejs/src/index.js";
import { scrollToStickyTop } from "../utils/sticky-scroll.js";
import { levenshtein, normalizeString } from "../utils/inspections.js";

const SORT_LABELS = {
  "date-desc": "Newest first",
  "date-asc": "Oldest first",
  "risk-desc": "Highest priority",
  "risk-asc": "Lowest priority",
  "alpha-asc": "Name A–Z",
  "alpha-desc": "Name Z–A",
};

const PRIORITIES = [
  { value: "", label: "All" },
  { value: "high", label: "High", color: "#D70000" },
  { value: "moderate", label: "Moderate", color: "#FFCB03" },
  { value: "low", label: "Low", color: "#009EDB" },
  { value: "none", label: "No violations" },
];

const PRIORITY_LABELS = {
  high: "High priority",
  moderate: "Moderate priority",
  low: "Low priority",
  none: "No violations",
};

function facilitiesLabel(n) {
  return `${n.toLocaleString()} ${n === 1 ? "facility" : "facilities"}`;
}

function clearAllFilters() {
  const store = Alpine.store("inspections");
  store.searchQuery = "";
  store.currentCity = "";
  store.currentPriority = "";
  store.currentSort = "date-desc";
  localStorage.removeItem("inspections-sort");
  window.dispatchEvent(new CustomEvent("inspections-clear-search"));
}

function clearQuery() {
  Alpine.store("inspections").searchQuery = "";
  window.dispatchEvent(new CustomEvent("inspections-clear-search"));
}

export function inspectionsEmpty() {
  return {
    get store() {
      return Alpine.store("inspections");
    },

    get query() {
      return (this.store.searchQuery || "").trim();
    },

    get heading() {
      return this.query
        ? `No facilities match “${this.query}”`
        : "No facilities match these filters";
    },

    get chips() {
      const st = this.store;
      const out = [];
      if (this.query) out.push({ key: "query", label: `“${this.query}”` });
      if (st.currentCity) out.push({ key: "city", label: st.currentCity });
      if (st.currentPriority)
        out.push({
          key: "priority",
          label: PRIORITY_LABELS[st.currentPriority] || st.currentPriority,
        });
      return out;
    },

    get suggestion() {
      const q = normalizeString(this.query);
      if (q.length < 3 || /\d/.test(q)) return "";
      let best = "";
      let bestDistance = 3;
      for (const c of Alpine.raw(this.store.cities) || []) {
        const name = normalizeString(c.text);
        if (Math.abs(name.length - q.length) > 2) continue;
        const d = levenshtein(name, q);
        if (d > 0 && d < bestDistance && c.text !== this.store.currentCity) {
          best = c.text;
          bestDistance = d;
        }
      }
      return best;
    },

    remove(key) {
      if (key === "query") clearQuery();
      if (key === "city") this.store.currentCity = "";
      if (key === "priority") this.store.currentPriority = "";
    },

    useSuggestion() {
      const city = this.suggestion;
      clearQuery();
      this.store.currentCity = city;
    },

    clearAll: clearAllFilters,
  };
}

function navHeight() {
  const nav = document.querySelector("header.sticky");
  return nav ? nav.getBoundingClientRect().height : 57;
}

export default function inspectionsMobile() {
  return {
    view: "list",
    showBar: false,
    showThumb: true,
    searching: false,
    kb: 0,
    preview: false,
    previewId: "",
    mapId: "inspections-map-mobile",
    _frame: 0,
    _nav: 0,

    get store() {
      return Alpine.store("inspections");
    },

    priorities: PRIORITIES,
    sortOptions: Object.entries(SORT_LABELS).map(([value, label]) => ({
      value,
      label,
    })),

    get loaded() {
      return !!this.store.allData?.length;
    },

    get countLabel() {
      if (!this.loaded) return "Loading facilities…";
      const n = facilitiesLabel(this.store.filteredData?.length || 0);
      return this.store.currentCity ? `${n} in ${this.store.currentCity}` : n;
    },

    get sortLabel() {
      return SORT_LABELS[this.store.currentSort] || SORT_LABELS["date-desc"];
    },

    get summary() {
      return this.loaded
        ? `${this.countLabel} · ${this.sortLabel}`
        : this.countLabel;
    },

    get query() {
      return (this.store.searchQuery || "").trim();
    },

    get hasActive() {
      const st = this.store;
      return !!(
        this.query ||
        st.currentCity ||
        st.currentPriority ||
        (st.currentSort && st.currentSort !== "date-desc")
      );
    },

    setPriority(value) {
      this.store.currentPriority =
        value && this.store.currentPriority === value ? "" : value;
    },

    clearQuery,
    clearAll: clearAllFilters,

    locating: false,

    openAlerts() {
      window.dispatchEvent(
        new CustomEvent("open-city-alerts-modal", {
          detail: { city: this.store.currentCity || "" },
        }),
      );
    },

    get pageLabel() {
      const st = this.store;
      return `Page ${(st.currentPage || 1).toLocaleString()} of ${(st.totalPages || 1).toLocaleString()}`;
    },

    init() {
      const schedule = () => {
        if (this._frame) return;
        this._frame = requestAnimationFrame(() => {
          this._frame = 0;
          this.update();
        });
      };
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      new ResizeObserver(() => {
        document.documentElement.style.setProperty(
          "--mobile-bar-h",
          this.$refs.bar.offsetHeight + "px",
        );
        schedule();
      }).observe(this.$refs.bar);
      new ResizeObserver(schedule).observe(this.$el);

      const vv = window.visualViewport;
      if (vv) {
        const onViewport = () => {
          this.kb = Math.max(
            0,
            Math.round(window.innerHeight - vv.height - vv.offsetTop),
          );
        };
        vv.addEventListener("resize", onViewport);
        vv.addEventListener("scroll", onViewport);
      }

      this.$watch("searching", schedule);
      schedule();
    },

    update() {
      const nav = navHeight();
      if (nav !== this._nav) {
        this._nav = nav;
        document.documentElement.style.setProperty(
          "--mobile-nav-h",
          nav + "px",
        );
      }
      const barH = this.$refs.bar.offsetHeight;
      const introBottom = this.$refs.introEnd.getBoundingClientRect().top;
      const end = this.$refs.end.getBoundingClientRect().top;
      this.showBar = introBottom <= nav + barH && end > nav + barH;
      const content = this.view === "map" ? this.$refs.map : this.$refs.list;
      const resultsTop = content.getBoundingClientRect().top;
      this.showThumb =
        this.searching ||
        end > window.innerHeight * 0.45 ||
        resultsTop >= nav + barH - 2;
    },

    setView(view) {
      if (this.view === view) return;
      if (view === "map" && document.querySelector(".detail-content")) {
        window.dispatchEvent(new CustomEvent("inspections-back-to-results"));
      }
      this.closePreview();
      const pinned = this.showBar;
      this.view = view;
      this.$nextTick(() => {
        if (pinned) {
          scrollToStickyTop(view === "map" ? this.$refs.map : this.$refs.list);
        }
        this.update();
        window.dispatchEvent(
          new CustomEvent("mobile-view-changed", { detail: { view } }),
        );
      });
    },

    prevPage() {
      if (this.store.currentPage > 1) this.store.currentPage--;
    },

    nextPage() {
      if (this.store.currentPage < this.store.totalPages)
        this.store.currentPage++;
    },

    realCard(id) {
      return id ? this.$refs.list.querySelector(`#${CSS.escape(id)}`) : null;
    },

    selectMarker(event) {
      if (event.detail?.mapId !== this.mapId) return;
      const source = this.realCard(event.detail.id);
      if (!source) return;
      const clone = source.cloneNode(true);
      clone.removeAttribute("id");
      clone.classList.remove("hidden-by-detail");
      clone.style.display = "";
      clone.querySelector(".detail-content")?.remove();
      clone.querySelector(".list-content")?.classList.remove("hidden");
      this.previewId = event.detail.id;
      this.$refs.previewSlot.replaceChildren(clone);
      this.preview = true;
    },

    closePreview() {
      if (!this.preview) return;
      this.preview = false;
      this.previewId = "";
      this.$refs.previewSlot.replaceChildren();
    },

    onPreviewClick(event) {
      const real = this.realCard(this.previewId);
      if (!real) return;
      if (event.target.closest("[data-read-more]")) {
        event.preventDefault();
        event.stopPropagation();
        this.setView("list");
        requestAnimationFrame(() =>
          real.querySelector("[data-read-more]")?.click(),
        );
        return;
      }
      if (event.target.closest('[data-action="card-alerts"]')) {
        event.preventDefault();
        event.stopPropagation();
        real.querySelector('[data-action="card-alerts"]')?.click();
      }
    },
  };
}
