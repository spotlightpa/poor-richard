import Alpine from "alpinejs/src/index.js";
import { scrollToStickyTop, stickyOffset } from "../utils/sticky-scroll.js";
import {
  generateInspectionCardId,
  levenshtein,
  normalizeString,
  parseInspectionDate,
  simplifyAddress,
} from "../utils/inspections.js";
import { countRisks, createInspectionCard } from "./inspections-data.js";
import { AREA_LIMIT, createAreaMap } from "./inspections-area-map.js";

const SORT_LABELS = {
  "date-desc": "Newest first",
  "date-asc": "Oldest first",
  "count-desc": "Most violations",
  "count-asc": "Fewest violations",
  "alpha-asc": "Name A–Z",
  "alpha-desc": "Name Z–A",
};

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

function worstLevel(c) {
  if (c.high) return "high";
  if (c.moderate) return "moderate";
  if (c.low) return "low";
  return "none";
}

function navHeight() {
  const nav = document.querySelector("header.sticky");
  return nav ? nav.getBoundingClientRect().height : 57;
}

export default function inspectionsMobile() {
  return {
    view: "list",
    showBar: false,
    sheetOpen: false,
    sortOpen: false,
    locating: false,
    _sortOpener: null,
    _sortTimer: 0,
    _padTop: "",
    mapDetail: false,
    _detailId: "",
    areaMode: "",
    areaIds: [],
    areaCards: [],
    _area: null,
    _map: null,
    _points: [],
    _order: null,
    _activeId: "",
    _quietMove: false,
    _pendingDetail: "",
    _mapPinned: false,
    _pendingFit: false,
    zoomHint: false,
    _hintTimer: 0,
    mapId: "inspections-map-mobile",
    _frame: 0,
    _nav: 0,

    get store() {
      return Alpine.store("inspections");
    },

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

    get query() {
      return (this.store.searchQuery || "").trim();
    },

    get sortChanged() {
      const sort = this.store.currentSort;
      return !!sort && sort !== "date-desc";
    },

    resetSort() {
      this.store.currentSort = "date-desc";
      localStorage.removeItem("inspections-sort");
    },

    get priorityLabel() {
      const p = this.store.currentPriority;
      return PRIORITY_LABELS[p] || p;
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

    clearQuery,
    clearAll: clearAllFilters,

    openAlerts() {
      window.dispatchEvent(
        new CustomEvent("open-city-alerts-modal", {
          detail: { city: this.store.currentCity || "" },
        }),
      );
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

      this.$refs.sheet.inert = true;
      this.initSheetDrag(this.$refs.sortSheet, () => this.closeSort());
      this.$watch("store.searchQuery", () => this.closeSheet());
      this.$watch("store.currentCity", () => this.closeSheet());
      window.addEventListener("inspections-back-to-results", () =>
        this.closeMapDetail(),
      );
      window.addEventListener("resize", () => {
        if (!this._mapPinned) return;
        requestAnimationFrame(() => scrollToStickyTop(this.$refs.map));
      });
      window.addEventListener("inspections-facility-chosen", (e) => {
        if (this.view !== "map" || window.innerWidth >= 850) return;
        e.detail.handled = true;
        this._pendingDetail = e.detail.id;
        this.closeSheet();
      });
      window.addEventListener("inspections-locating", (e) => {
        if (e.detail?.scope === "mobile-sheet")
          this.locating = !!e.detail.loading;
      });
      window.addEventListener("map:loaded", (e) => {
        if (e.detail?.id === this.mapId) this.setupArea(e.detail.map);
      });
      this.$watch("store.sortedFilteredData", () => this.refreshArea(true));
      window
        .matchMedia("(min-width: 850px)")
        .addEventListener("change", (e) => {
          if (!e.matches) return;
          this.closeMapDetail();
          this.closeSort(false);
          this.closeSheet(false);
        });
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
      this.showBar = introBottom <= nav + barH + 1 && end > nav + barH;
      this._mapPinned =
        this.view === "map" &&
        Math.abs(this.$refs.map.getBoundingClientRect().top - (nav + barH)) < 3;
      this.syncOverlayInsets();
    },

    initSheetDrag(sheet, close) {
      const panel = sheet.querySelector("[data-sheet-panel]");
      const backdrop = sheet.querySelector("[data-sheet-backdrop]");
      const head = sheet.querySelector("[data-sheet-head]");
      const body = sheet.querySelector("[data-sheet-body]");
      let drag = null;

      const begin = (y) => {
        drag = { y, t: performance.now(), dy: 0 };
        panel.style.transition = "none";
        backdrop.style.transition = "none";
        sheet.querySelector("input")?.blur();
      };
      const moveTo = (dy) => {
        drag.dy = dy;
        const offset = dy > 0 ? dy : dy / 4;
        panel.style.transform = `translateY(${offset}px)`;
        backdrop.style.opacity = String(
          1 - Math.min(1, Math.max(0, dy) / panel.offsetHeight),
        );
      };
      const finish = () => {
        if (!drag) return;
        const { dy, t } = drag;
        drag = null;
        const velocity = dy / Math.max(1, performance.now() - t);
        panel.style.transition = "";
        backdrop.style.transition = "";
        void panel.offsetHeight;
        panel.style.transform = "";
        backdrop.style.opacity = "";
        if (dy > 110 || velocity > 0.5) close();
      };

      head.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if (e.target.closest("button, input")) return;
        head.setPointerCapture?.(e.pointerId);
        begin(e.clientY);
      });
      head.addEventListener("pointermove", (e) => {
        if (drag) moveTo(e.clientY - drag.y);
      });
      head.addEventListener("pointerup", finish);
      head.addEventListener("pointercancel", finish);

      let touch = null;
      body.addEventListener(
        "touchstart",
        (e) => {
          touch =
            body.scrollTop <= 0
              ? { y: e.touches[0].clientY, active: false }
              : null;
        },
        { passive: true },
      );
      body.addEventListener(
        "touchmove",
        (e) => {
          if (!touch) return;
          const dy = e.touches[0].clientY - touch.y;
          if (!touch.active) {
            if (dy < 8 || body.scrollTop > 0) {
              if (dy < 0) touch = null;
              return;
            }
            touch.active = true;
            begin(touch.y + 8);
          }
          e.preventDefault();
          moveTo(e.touches[0].clientY - drag.y);
        },
        { passive: false },
      );
      const touchEnd = () => {
        if (touch?.active) finish();
        touch = null;
      };
      body.addEventListener("touchend", touchEnd);
      body.addEventListener("touchcancel", touchEnd);
    },

    syncOverlayInsets() {
      const top = window.innerHeight < 500 ? "0px" : "48px";
      if (top === this._padTop) return;
      this._padTop = top;
      this.$refs.map.style.setProperty("--map-pad-top", top);
      if (this.view === "map") {
        window.dispatchEvent(new CustomEvent("map:refit"));
      }
    },

    openSheet(field) {
      if (this.sheetOpen) return;
      const anchor =
        field || (this.showBar ? this.$refs.barField : this.$refs.headerField);
      const r = anchor.getBoundingClientRect();
      const sheet = this.$refs.sheet;
      sheet.style.setProperty("--search-top", `${Math.max(0, r.top)}px`);
      sheet.style.setProperty("--search-left", `${r.left}px`);
      sheet.style.setProperty("--search-right", `${r.left}px`);
      const replacing = this.sortOpen;
      if (replacing) this.closeSort(false);
      this._opener = replacing ? this._sortOpener : document.activeElement;
      sheet.inert = false;
      const input = sheet.querySelector("input");
      input?.focus({ preventScroll: true });
      input?.select();
      this.sheetOpen = true;
      document.documentElement.classList.add("overflow-hidden");
    },

    closeSheet(refocus = true) {
      if (!this.sheetOpen) return;
      const sheet = this.$refs.sheet;
      sheet.querySelector("input")?.blur();
      this.sheetOpen = false;
      sheet.inert = true;
      if (refocus) {
        this.$nextTick(() => this._opener?.focus({ preventScroll: true }));
      }
      document.documentElement.classList.remove("overflow-hidden");
      window.dispatchEvent(
        new CustomEvent("inspections-apply-search", {
          detail: { value: this.store.searchQuery || "" },
        }),
      );
    },

    clearHeaderSearch() {
      this.store.searchQuery = "";
      window.dispatchEvent(new CustomEvent("inspections-clear-search"));
    },

    locateFromHeader() {
      window.dispatchEvent(
        new CustomEvent("inspections-locate", {
          detail: { scope: "mobile-sheet" },
        }),
      );
    },

    openSort() {
      if (this.sortOpen) return;
      const replacing = this.sheetOpen;
      if (replacing) this.closeSheet(false);
      this._sortOpener = replacing ? this._opener : document.activeElement;
      this.$refs.sortSheet.inert = false;
      this.sortOpen = true;
      document.documentElement.classList.add("overflow-hidden");
      this.$nextTick(() =>
        this.$refs.sortSheet
          .querySelector('[role="radio"][aria-checked="true"]')
          ?.focus({ preventScroll: true }),
      );
    },

    closeSort(refocus = true) {
      clearTimeout(this._sortTimer);
      if (!this.sortOpen) return;
      this.sortOpen = false;
      this.$refs.sortSheet.inert = true;
      if (!this.sheetOpen) {
        document.documentElement.classList.remove("overflow-hidden");
      }
      if (refocus) {
        this.$nextTick(() => this._sortOpener?.focus({ preventScroll: true }));
      }
    },

    chooseSort(value) {
      this.store.currentSort = value;
      clearTimeout(this._sortTimer);
      this._sortTimer = setTimeout(
        () => this.closeSort(),
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180,
      );
    },

    moveSort(step) {
      const values = this.sortOptions.map((o) => o.value);
      const i = values.indexOf(this.store.currentSort);
      const next = values[(i + step + values.length) % values.length];
      this.store.currentSort = next;
      this.$nextTick(() =>
        this.$refs.sortSheet
          .querySelector(`[data-sort="${next}"]`)
          ?.focus({ preventScroll: true }),
      );
    },

    setView(view) {
      if (this.view === view) return;
      if (
        (view === "map" || this.mapDetail) &&
        document.querySelector(".detail-content")
      ) {
        window.dispatchEvent(new CustomEvent("inspections-back-to-results"));
      }
      const wasPinned = this.showBar;
      const pinned = wasPinned || view === "map";
      const from = view === "map" ? this.$refs.list : this.$refs.map;
      const top = wasPinned
        ? Math.max(
            0,
            from.getBoundingClientRect().top + window.scrollY - stickyOffset(),
          )
        : null;
      const to = view === "map" ? this.$refs.map : this.$refs.list;
      from.style.display = "none";
      to.style.removeProperty("display");
      this.view = view;
      if (top !== null) window.scrollTo({ top, behavior: "instant" });
      this.$nextTick(() => {
        if (pinned) {
          scrollToStickyTop(view === "map" ? this.$refs.map : this.$refs.list, {
            smooth:
              !wasPinned &&
              !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          });
        }
        this.update();
        window.dispatchEvent(
          new CustomEvent("mobile-view-changed", { detail: { view } }),
        );
        if (view === "map" && this._map) {
          requestAnimationFrame(() => {
            this._map.resize();
            if (this._pendingFit) this.fitArea();
            else this.updateAreaMode();
          });
        }
      });
    },

    get zoomHintText() {
      return /Mac|iPhone|iPad/.test(navigator.userAgent)
        ? "Use ⌘ + scroll to zoom the map"
        : "Use Ctrl + scroll to zoom the map";
    },

    onMapWheel(event) {
      if (event.ctrlKey || event.metaKey) {
        this.zoomHint = false;
        return;
      }
      event.stopPropagation();
      if (this.mapDetail || this.$refs.strip?.contains(event.target)) return;
      this.zoomHint = true;
      clearTimeout(this._hintTimer);
      this._hintTimer = setTimeout(() => (this.zoomHint = false), 1200);
    },

    get areaMessage() {
      if (this.areaMode === "zoom") return "Zoom in";
      if (this.areaMode === "empty") return "No facilities";
      if (this.areaMode === "results")
        return facilitiesLabel(this.areaIds.length);
      return "";
    },

    setupArea(map) {
      if (this._area) return;
      this._map = map;
      this._area = createAreaMap(map, {
        onPick: (id) => this.pickFacility(id),
      });
      map.on("moveend", () => this.onAreaMove());
      this.refreshArea(true);
    },

    refreshArea(refit) {
      if (!this._area) return;
      const grouped = Alpine.raw(this.store.groupedFacilities) || {};
      const ids = Alpine.raw(this.store.sortedFilteredData) || [];
      const points = [];
      const order = new Map();
      ids.forEach((id, i) => {
        const row = grouped[id]?.[0];
        if (!row) return;
        const lat = parseFloat(row.Latitude);
        const lon = parseFloat(row.Longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
        points.push({
          id,
          lat,
          lon,
          name: row.facility || "Facility",
          w: worstLevel(countRisks(row.risk_level)),
        });
        order.set(id, i);
      });
      this._points = points;
      this._order = order;
      this._area.setData(points);
      this._area.select("");
      this.areaIds = [];
      this.areaCards = [];
      const pending = this._pendingDetail;
      if (pending && this.view === "map") {
        this._pendingDetail = "";
        const p = points.find(
          (q) => q.id === pending || generateInspectionCardId(q.id) === pending,
        );
        if (p) {
          this._activeId = p.id;
          this._map.jumpTo({
            center: [p.lon, p.lat],
            zoom: Math.max(this._map.getZoom(), 15),
          });
        }
        let opened = false;
        const open = () => {
          if (opened || this.view !== "map") return;
          opened = true;
          if (p) this.areaReadMore(p.id);
        };
        window.addEventListener("inspections-page-rendered", open, {
          once: true,
        });
        setTimeout(open, 400);
        return;
      }
      const narrowed = !!(this.query || this.store.currentCity);
      if (refit && narrowed && points.length) {
        this._pendingFit = true;
        if (this.view === "map") this.fitArea();
      } else {
        this.updateAreaMode();
      }
    },

    fitArea() {
      this._pendingFit = false;
      if (!this._points.length) return this.updateAreaMode();
      const bounds = new window.maplibregl.LngLatBounds();
      Alpine.raw(this._points).forEach((p) => bounds.extend([p.lon, p.lat]));
      this._map.fitBounds(bounds, {
        padding: { top: 72, bottom: 72, left: 40, right: 40 },
        maxZoom: 14,
        duration: 0,
      });
    },

    onAreaMove() {
      if (this._quietMove) {
        this._quietMove = false;
        return;
      }
      this.updateAreaMode();
    },

    revealActive() {
      const pt = this._area?.pointOnScreen(this._activeId);
      const strip = this.$refs.strip;
      if (!pt || !strip) return;
      const pane = this.$refs.map.getBoundingClientRect();
      const key = this.$refs.mapKey?.getBoundingClientRect();
      const card = strip
        .querySelector("[data-area-id]")
        ?.getBoundingClientRect();
      const top = (key?.bottom || pane.top) + 24;
      const bottom = (card?.top || pane.bottom) - 24;
      const left = pane.left + 24;
      const right = pane.right - 24;
      if (bottom <= top) return;
      const dx = pt.x < left ? pt.x - left : pt.x > right ? pt.x - right : 0;
      const dy = pt.y < top ? pt.y - top : pt.y > bottom ? pt.y - bottom : 0;
      if (!dx && !dy) return;
      this._quietMove = true;
      this._map.panBy([dx, dy], {
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 0
          : 300,
      });
    },

    idsInView(cap = Infinity) {
      if (!this._map) return [];
      const b = this._map.getBounds();
      const west = b.getWest();
      const east = b.getEast();
      const south = b.getSouth();
      const north = b.getNorth();
      const ids = [];
      for (const p of Alpine.raw(this._points)) {
        if (p.lon < west || p.lon > east || p.lat < south || p.lat > north)
          continue;
        ids.push(p.id);
        if (ids.length >= cap) break;
      }
      return ids;
    },

    countInView() {
      return this.idsInView(AREA_LIMIT + 1).length;
    },

    updateAreaMode() {
      if (!this._map) return;
      const inView = this.idsInView(AREA_LIMIT + 1);
      const n = inView.length;
      if (n && n <= AREA_LIMIT) return this.searchArea(inView);
      this.areaMode = n ? "zoom" : "empty";
      this.areaIds = [];
      this.areaCards = [];
      this._activeId = "";
      this._area.select("");
    },

    searchArea(inView) {
      if (!this._map) return;
      const order = Alpine.raw(this._order);
      const ids = (inView || this.idsInView())
        .sort((a, c) => order.get(a) - order.get(c))
        .slice(0, AREA_LIMIT);
      this.areaMode = ids.length ? "results" : "empty";
      if (
        ids.length === this.areaIds.length &&
        ids.every((id, i) => id === this.areaIds[i])
      ) {
        return;
      }
      const keep = ids.indexOf(this._activeId);
      this.areaIds = ids;
      this.areaCards = [];
      this.extendAreaCards(Math.max(keep, 0));
      this._activeId = keep >= 0 ? this._activeId : ids[0] || "";
      this.$nextTick(() => {
        const strip = this.$refs.strip;
        const el = strip?.querySelector(
          `[data-area-id="${CSS.escape(this._activeId)}"]`,
        );
        if (strip) {
          strip.scrollLeft = el
            ? el.offsetLeft - (strip.clientWidth - el.offsetWidth) / 2
            : 0;
        }
        this._area.select(this._activeId);
      });
    },

    facilityGroup(id) {
      const group = Alpine.raw(this.store.groupedFacilities)?.[id];
      if (!group) return null;
      return [...group].sort(
        (a, b) =>
          parseInspectionDate(b.inspection_date) -
          parseInspectionDate(a.inspection_date),
      );
    },

    areaCard(id) {
      const row = this.facilityGroup(id)[0];
      const c = countRisks(row.risk_level);
      const lines = [
        ["high", "high priority violation"],
        ["moderate", "moderate priority violation"],
        ["low", "low priority violation"],
        ["other", "other violation"],
      ]
        .filter(([level]) => c[level])
        .map(([level, label]) => ({
          level,
          text: `${c[level]} ${label}${c[level] === 1 ? "" : "s"}`,
          short: `${c[level]} ${level}`,
        }));
      return {
        id,
        name: row.facility || "Facility",
        line: [
          simplifyAddress(row.address || "") || row.city,
          row.inspection_date,
        ]
          .filter(Boolean)
          .join(" · "),
        lines,
      };
    },

    extendAreaCards(index = 0) {
      const target = Math.min(
        this.areaIds.length,
        Math.max(this.areaCards.length + 20, index + 1),
      );
      if (target <= this.areaCards.length) return;
      this.areaCards = this.areaCards.concat(
        this.areaIds
          .slice(this.areaCards.length, target)
          .map((id) => this.areaCard(id)),
      );
    },

    onStripScroll() {
      const strip = this.$refs.strip;
      if (!strip) return;
      const mid = strip.scrollLeft + strip.clientWidth / 2;
      let best = null;
      let bestDistance = Infinity;
      for (const el of strip.querySelectorAll("[data-area-id]")) {
        const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
        if (d < bestDistance) {
          bestDistance = d;
          best = el;
        }
      }
      if (best && best.dataset.areaId !== this._activeId) {
        this._activeId = best.dataset.areaId;
        this._area.select(this._activeId);
        this.revealActive();
      }
      if (strip.scrollLeft + strip.clientWidth > strip.scrollWidth - 600) {
        this.extendAreaCards();
      }
    },

    pickFacility(id) {
      let i = this.areaIds.indexOf(id);
      if (i < 0 && this.countInView() <= AREA_LIMIT) {
        this.searchArea();
        i = this.areaIds.indexOf(id);
      }
      if (i < 0) {
        this.areaIds = [id];
        this.areaCards = [this.areaCard(id)];
        i = 0;
      }
      this.extendAreaCards(i);
      this._activeId = id;
      this.$nextTick(() => {
        const strip = this.$refs.strip;
        const el = strip?.querySelector(`[data-area-id="${CSS.escape(id)}"]`);
        if (el) {
          strip.scrollTo({
            left: el.offsetLeft - (strip.clientWidth - el.offsetWidth) / 2,
            behavior: "smooth",
          });
        }
        this._area.select(id);
      });
    },

    areaReadMore(id) {
      const group = this.facilityGroup(id);
      if (!group) return;
      this.openMapDetail(createInspectionCard(group[0], "map", group), id);
    },

    areaAlerts(id) {
      const group = this.facilityGroup(id);
      if (!group) return;
      const card = createInspectionCard(group[0], "map", group);
      this.$refs.areaTemp.replaceChildren(card);
      card.querySelector('[data-action="card-alerts"]')?.click();
      this.$refs.areaTemp.replaceChildren();
    },

    openMapDetail(card, id) {
      this._detailId = id;
      this.$refs.mapDetail.replaceChildren(card);
      this.$refs.mapDetail.scrollTop = 0;
      this.mapDetail = true;
      requestAnimationFrame(() =>
        card.querySelector("[data-read-more]")?.click(),
      );
    },

    closeMapDetail(refocus = false) {
      if (!this.mapDetail) return;
      this.$refs.mapDetail.replaceChildren();
      this.mapDetail = false;
      const id = this._detailId;
      this._detailId = "";
      if (!refocus || !id) return;
      requestAnimationFrame(() =>
        this.$refs.strip
          ?.querySelector(`[data-area-id="${CSS.escape(id)}"] [data-area-read]`)
          ?.focus({ preventScroll: true }),
      );
    },
  };
}
