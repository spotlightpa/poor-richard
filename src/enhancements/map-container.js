/* global maplibregl */

function splitColumns(template) {
  if (!template.trim()) return [];
  return template
    .split(/\{\{\s*column\s*\}\}/i)
    .map((part) => part.replace(/^(\s|<br\s*\/?>)+|(\s|<br\s*\/?>)+$/gi, ""))
    .filter((part) => part.trim());
}

class ResetViewControl {
  constructor(onReset) {
    this.onReset = onReset;
  }
  onAdd() {
    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";
    const button = document.createElement("button");
    button.type = "button";
    button.title = "Show full map";
    button.setAttribute("aria-label", "Show full map");
    button.innerHTML =
      '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="m-auto block"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>';
    button.addEventListener("click", () => this.onReset());
    this.container.appendChild(button);
    return this.container;
  }
  onRemove() {
    this.container.remove();
  }
}

export default function mapContainer(config) {
  return {
    map: null,
    geojsonUrl: config.geojson,
    mapColor: config.mapColor,
    colorOpacity: config.colorOpacity,
    tooltipsEnabled: config.tooltipsEnabled,
    tooltipTemplate: config.tooltipTemplate,
    customCodeUrl: config.customCodeUrl,
    customCodeProperty: config.customCodeProperty,
    searchUseLocation: !!config.searchUseLocation,
    cardTemplates: splitColumns(config.tooltipTemplate || ""),
    desktopCards: !!config.desktopCards,
    mobileCards: !!config.mobileCards,
    lastResult: null,
    districtsData: null,
    searchQuery: "",
    isSearching: false,
    isLocating: false,
    errorState: false,
    marker: null,
    tooltip: null,
    init() {
      const main = document.querySelector("main[data-ga-category=main]");
      if (main) main.classList.add("min-h-dvh");
      if (!window.maplibregl) {
        const wait = setInterval(() => {
          if (window.maplibregl) {
            clearInterval(wait);
            this.initMap();
          }
        }, 50);
      } else {
        this.initMap();
      }
    },
    initMap() {
      if (this.map) return;
      this.map = new maplibregl.Map({
        container: this.$refs.canvas,
        style: "https://tiles.openfreemap.org/styles/positron",
        center: [-75.9, 40.9],
        zoom: 8,
        attributionControl: true,
        cooperativeGestures: true,
      });
      this.navControl = new maplibregl.NavigationControl({
        showCompass: false,
      });
      this.resetControl = new ResetViewControl(() => this.resetView());
      this.navIsMd = window.matchMedia("(min-width: 768px)").matches;
      this.addNavControls(this.navIsMd ? "top-right" : "bottom-right");
      window.addEventListener("resize", () => this.updateNavPosition());
      const ro = new ResizeObserver(() => this.map && this.map.resize());
      ro.observe(this.$refs.canvas);
      this.map.on("load", () => this.loadGeoJSON());
      const mq = window.matchMedia("(min-width: 850px)");
      mq.addEventListener("change", () => this.refreshResult());
      window.addEventListener("resize", () => this.layoutCards());
      this.map.on("move", () => this.positionTooltip());
    },
    updateNavPosition() {
      const isMd = window.matchMedia("(min-width: 768px)").matches;
      if (isMd === this.navIsMd || !this.map) return;
      this.navIsMd = isMd;
      this.map.removeControl(this.navControl);
      this.map.removeControl(this.resetControl);
      this.addNavControls(isMd ? "top-right" : "bottom-right");
    },
    addNavControls(position) {
      if (position.startsWith("bottom")) {
        this.map.addControl(this.resetControl, position);
        this.map.addControl(this.navControl, position);
      } else {
        this.map.addControl(this.navControl, position);
        this.map.addControl(this.resetControl, position);
      }
      this.$refs.canvas
        .querySelectorAll(
          ".maplibregl-ctrl-top-right, .maplibregl-ctrl-bottom-right",
        )
        .forEach((corner) => {
          corner.classList.add("z-30!");
        });
    },
    async loadGeoJSON() {
      if (!this.geojsonUrl || this.map.getSource("shapes")) return;
      const res = await fetch(this.geojsonUrl);
      const data = await res.json();
      this.districtsData = data;

      this.map.addSource("shapes", { type: "geojson", data });

      this.map.addLayer({
        id: "shapes-fill",
        type: "fill",
        source: "shapes",
        paint: {
          "fill-color": this.mapColor,
          "fill-opacity": Number(this.colorOpacity),
        },
      });

      this.map.addLayer({
        id: "shapes-line",
        type: "line",
        source: "shapes",
        paint: {
          "line-color": this.mapColor,
          "line-width": 2,
        },
      });

      document
        .querySelectorAll("#map-card-section [data-card-close]")
        .forEach((btn) =>
          btn.addEventListener("click", () => this.closeResult()),
        );
      if (this.$refs.cardStrip) {
        this.$refs.cardStrip
          .querySelector("[data-card-close]")
          .addEventListener("click", () => this.closeResult());
      }
      this.map.on("click", (e) => {
        if (this.resultMode() !== "strip" || !this.lastResult) return;
        const target = e.originalEvent && e.originalEvent.target;
        if (target && target.closest && target.closest(".maplibregl-marker")) {
          return;
        }
        if (!this.map.getLayer("shapes-fill")) return;
        const hits = this.map.queryRenderedFeatures(e.point, {
          layers: ["shapes-fill"],
        });
        if (!hits.length) this.closeResult();
      });
      this.map.on("click", "shapes-fill", (e) => {
        if (this.resultMode() === "none") return;
        const feature = e.features && e.features[0];
        if (!feature) return;
        if (this.marker) {
          this.marker.remove();
          this.marker = null;
        }
        this.showResult(e.lngLat.lng, e.lngLat.lat, feature, true);
      });

      this.map.on("mousemove", "shapes-fill", () => {
        this.map.getCanvas().classList.add("cursor-pointer!");
      });
      this.map.on("mouseleave", "shapes-fill", () => {
        this.map.getCanvas().classList.remove("cursor-pointer!");
      });

      this.fitToData(data);
      this.loadCustomCode();
    },
    resetView() {
      if (!this.districtsData) return;
      const bounds = this.dataBounds(this.districtsData);
      if (bounds.isEmpty()) return;
      const height = this.$refs.canvas.getBoundingClientRect().height;
      const stripH = this.stripHeight();
      let bottom = 40;
      if (stripH) {
        const withStrip = stripH + this.stripOffset() + 16;
        if (height - 80 - withStrip >= 140) bottom = withStrip;
      }
      const padding = { top: 80, bottom, left: 40, right: 40 };
      this.map.setMaxBounds(null);
      this.map.setMinZoom(0);
      const camera = this.map.cameraForBounds(bounds, { padding });
      if (!camera) return;
      const limits = this.viewLimits(bounds);
      this.map.setMaxBounds(limits.maxBounds);
      this.map.setMinZoom(Math.min(limits.minZoom, camera.zoom));
      this.map.easeTo({ ...camera, padding: 0, duration: 600 });
    },
    viewLimits(bounds) {
      const padFactor = 0.6;
      const minPadDeg = 0.15;
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const lngPad = Math.max((ne.lng - sw.lng) * padFactor, minPadDeg);
      const latPad = Math.max((ne.lat - sw.lat) * padFactor, minPadDeg);
      const maxBounds = new maplibregl.LngLatBounds(
        [sw.lng - lngPad, sw.lat - latPad],
        [ne.lng + lngPad, ne.lat + latPad],
      );
      const fit = this.map.cameraForBounds(maxBounds, { padding: 20 });
      const minZoom =
        fit && typeof fit.zoom === "number" ? Math.max(0, fit.zoom - 0.1) : 0;
      return { maxBounds, minZoom };
    },
    dataBounds(data) {
      const bounds = new maplibregl.LngLatBounds();
      const extendBounds = (coords) => {
        if (!Array.isArray(coords) || coords.length === 0) return;
        if (typeof coords[0] === "number" && typeof coords[1] === "number") {
          bounds.extend([coords[0], coords[1]]);
        } else {
          coords.forEach(extendBounds);
        }
      };
      data.features.forEach((f) => {
        if (f.geometry) extendBounds(f.geometry.coordinates);
      });
      return bounds;
    },
    fitToData(data) {
      const bounds = new maplibregl.LngLatBounds();
      const extendBounds = (coords) => {
        if (!Array.isArray(coords) || coords.length === 0) return;
        if (typeof coords[0] === "number" && typeof coords[1] === "number") {
          bounds.extend([coords[0], coords[1]]);
        } else {
          coords.forEach(extendBounds);
        }
      };
      data.features.forEach((f) => {
        if (f.geometry) extendBounds(f.geometry.coordinates);
      });
      if (bounds.isEmpty()) return;

      this.map.fitBounds(bounds, {
        padding: { top: 80, bottom: 40, left: 40, right: 40 },
        duration: 0,
      });

      const padFactor = 0.6;
      const minPadDeg = 0.15;
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const lngPad = Math.max((ne.lng - sw.lng) * padFactor, minPadDeg);
      const latPad = Math.max((ne.lat - sw.lat) * padFactor, minPadDeg);
      const maxBounds = new maplibregl.LngLatBounds(
        [sw.lng - lngPad, sw.lat - latPad],
        [ne.lng + lngPad, ne.lat + latPad],
      );
      this.map.setMaxBounds(maxBounds);

      const camera = this.map.cameraForBounds(maxBounds, { padding: 20 });
      if (camera && typeof camera.zoom === "number") {
        this.map.setMinZoom(Math.max(0, camera.zoom - 0.1));
      }
    },
    loadCustomCode() {
      if (!this.customCodeUrl) return;
      const script = document.createElement("script");
      script.src = this.customCodeUrl;
      script.onload = () => {
        if (typeof window.SPLMapCustomCode === "function") {
          window.SPLMapCustomCode(this.map, {
            sourceId: "shapes",
            mapColor: this.mapColor,
            data: this.districtsData,
            property: this.customCodeProperty,
          });
        }
      };
      document.head.appendChild(script);
    },
    async locate() {
      if (this.isLocating || !this.map) return;
      this.isLocating = true;
      this.errorState = false;
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 8000,
          }),
        );
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const matchedFeature =
          this.districtsData &&
          this.districtsData.features.find((f) =>
            this.pointInFeature([lon, lat], f),
          );
        if (!matchedFeature) {
          this.fail();
          return;
        }
        const revUrl =
          "https://viz-sample-ballot-2024.data.spotlightpa.org/api/geolocate?latlng=" +
          lat +
          "," +
          lon;
        const revRes = await fetch(revUrl);
        const revData = await revRes.json();
        const addr = revData?.results?.[0]?.formatted_address;
        if (addr) this.searchQuery = addr;
        this.dropPin(lon, lat, matchedFeature);
      } catch {
        this.fail();
      } finally {
        this.isLocating = false;
      }
    },
    async search() {
      const q = (this.searchQuery || "").trim();
      if (!q || this.isSearching || !this.map) return;
      this.isSearching = true;
      this.errorState = false;
      try {
        const url =
          "https://viz-sample-ballot-2024.data.spotlightpa.org/api/geolocate?address=" +
          encodeURIComponent(q);
        const res = await fetch(url);
        const data = await res.json();
        const result = data?.results?.[0]?.geometry?.location;
        if (!result) {
          this.fail();
          return;
        }
        const lon = result.lng;
        const lat = result.lat;
        const matchedFeature =
          this.districtsData &&
          this.districtsData.features.find((f) =>
            this.pointInFeature([lon, lat], f),
          );
        if (!matchedFeature) {
          this.fail();
          return;
        }
        this.dropPin(lon, lat, matchedFeature);
      } catch {
        this.fail();
      } finally {
        this.isSearching = false;
      }
    },
    fail() {
      if (this.marker) {
        this.marker.remove();
        this.marker = null;
      }
      this.searchQuery = "";
      this.errorState = true;
    },
    clearAll() {
      if (this.marker) {
        this.marker.remove();
        this.marker = null;
      }
      this.hideResult();
      this.searchQuery = "";
      this.errorState = false;
    },
    closeResult() {
      this.clearAll();
    },
    isMd() {
      return window.matchMedia("(min-width: 850px)").matches;
    },
    resultMode() {
      const cards = this.isMd() ? this.desktopCards : this.mobileCards;
      if (cards && this.cardTemplates.length) {
        return this.isMd() ? "strip" : "section";
      }
      if (this.tooltipsEnabled && this.tooltipTemplate) return "popup";
      return "none";
    },
    showResult(lon, lat, feature, noPin = false) {
      this.lastResult = { lon, lat, feature, noPin };
      const mode = this.resultMode();
      this.hideTooltip();
      this.hideCards();
      if (mode === "popup") {
        this.showTooltip(lon, lat, feature, noPin);
      } else if (mode !== "none") {
        this.showCards(mode, feature);
      }
    },
    refreshResult() {
      if (!this.lastResult) return;
      const { lon, lat, feature, noPin } = this.lastResult;
      this.showResult(lon, lat, feature, noPin);
    },
    hideResult() {
      this.lastResult = null;
      this.hideTooltip();
      this.hideCards();
    },
    cardContainer(mode) {
      if (mode === "strip") return this.$refs.cardStrip || null;
      return document.getElementById("map-card-section");
    },
    showCards(mode, feature) {
      const box = this.cardContainer(mode);
      if (!box) return;
      const cols = box.querySelector("[data-card-columns]");
      const props = feature ? feature.properties : {};
      cols.innerHTML = this.cardTemplates
        .map((tmpl) => {
          const html = this.renderTooltipTemplate(tmpl, props);
          return `<div class="min-w-0">${html}</div>`;
        })
        .join("");
      box.hidden = false;
      this.layoutCards();
      if (mode === "section") this.fitSection(box);
    },
    fitSection(section) {
      const map = this.$refs.canvas.closest("#map-container");
      const mapTop = map.getBoundingClientRect().top;
      const sectionH = section.getBoundingClientRect().height;
      if (mapTop >= 0 && mapTop < 80) {
        const room = window.innerHeight - mapTop - sectionH;
        if (room < map.getBoundingClientRect().height) {
          map.style.setProperty(
            "--map-fit-h",
            Math.max(320, Math.floor(room)) + "px",
          );
          map.classList.add("h-(--map-fit-h)!");
          this.map.resize();
        }
      }
      const r = section.getBoundingClientRect();
      if (r.bottom <= window.innerHeight + 1) return;
      const top = window.scrollY + r.bottom - window.innerHeight;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    },
    resetMapHeight() {
      const map = this.$refs.canvas.closest("#map-container");
      if (!map.classList.contains("h-(--map-fit-h)!")) return;
      map.classList.remove("h-(--map-fit-h)!");
      map.style.removeProperty("--map-fit-h");
      if (this.map) this.map.resize();
    },
    layoutCards() {
      this.layoutSwipeCards();
      const strip = this.$refs.cardStrip;
      if (!strip || strip.hidden) return;
      strip.style.setProperty("--strip-bottom", this.stripOffset() + "px");
      const grid = strip.querySelector("[data-card-columns]");
      const cols = [...grid.children];
      const rest = cols.length - 1;
      const narrow = rest > 0 && strip.getBoundingClientRect().width < 740;
      const wideCols = {
        1: "grid-cols-1",
        2: "grid-cols-[minmax(0,1fr)_fit-content(60%)]",
        3: "grid-cols-[minmax(0,1fr)_repeat(2,fit-content(30%))]",
        4: "grid-cols-[minmax(0,1fr)_repeat(3,fit-content(20%))]",
      };
      const narrowCols = {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
      };
      grid.className =
        "grid " +
        (narrow
          ? narrowCols[rest] || "grid-flow-col auto-cols-fr"
          : wideCols[cols.length] || "grid-flow-col auto-cols-fr");
      const corner = narrow ? cols[0] : cols[cols.length - 1];
      cols.forEach((col, i) => {
        const classes = ["min-w-0"];
        if (narrow && i === 0) classes.push("col-span-full");
        if (i && !(narrow && i === 1)) classes.push("border-l border-g-3");
        if (narrow && i) classes.push("border-t border-g-3");
        if (col === corner) classes.push("[&>*]:pr-10!");
        col.className = classes.join(" ");
      });
    },
    hideCards() {
      for (const mode of ["strip", "section"]) {
        const box = this.cardContainer(mode);
        if (box) box.hidden = true;
      }
      this.resetMapHeight();
    },
    layoutSwipeCards() {
      const section = document.getElementById("map-card-section");
      if (!section || section.hidden) return;
      const track = section.querySelector("[data-card-columns]");
      const dots = section.querySelector("[data-card-dots]");
      const cards = [...track.children];
      const single = cards.length < 2;
      cards.forEach((card) => {
        card.className = single
          ? "min-w-0 shrink-0 grow-0 basis-full snap-start overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.08),0_4px_12px_-6px_rgba(15,23,42,0.25)] [&>*]:h-full"
          : "min-w-0 shrink-0 grow-0 basis-[84%] snap-start overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.08),0_4px_12px_-6px_rgba(15,23,42,0.25)] [&>*]:h-full";
      });
      if (!dots) return;
      dots.hidden = single;
      dots.innerHTML = single
        ? ""
        : cards
            .map(
              (_, i) =>
                `<button type="button" data-dot="${i}" aria-label="Show section ${i + 1} of ${cards.length}" class="h-1.5 w-1.5 cursor-pointer rounded-full border-0 bg-g-4 p-0 transition-[width,background-color] duration-200"></button>`,
            )
            .join("");
      const activeBg = `bg-[${String(this.mapColor || "#009edb").replaceAll(" ", "_")}]`;
      const paint = () => {
        const step =
          cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 1;
        const active = Math.round(track.scrollLeft / step);
        dots.querySelectorAll("[data-dot]").forEach((dot, i) => {
          const on = i === active;
          dot.classList.toggle("w-4", on);
          dot.classList.toggle("w-1.5", !on);
          dot.classList.toggle(activeBg, on);
          dot.classList.toggle("bg-g-4", !on);
          dot.setAttribute("aria-current", on ? "true" : "false");
        });
      };
      dots.onclick = (e) => {
        const dot = e.target.closest("[data-dot]");
        if (!dot) return;
        const card = cards[Number(dot.dataset.dot)];
        track.scrollTo({
          left: card.offsetLeft - cards[0].offsetLeft,
          behavior: "smooth",
        });
      };
      track.onscroll = paint;
      track.scrollLeft = 0;
      paint();
    },
    bottomControlsHeight() {
      const canvas = this.$refs.canvas.getBoundingClientRect();
      const ctrls = this.$refs.canvas.querySelectorAll(
        ".maplibregl-ctrl-bottom-left .maplibregl-ctrl, .maplibregl-ctrl-bottom-right .maplibregl-ctrl",
      );
      let h = 0;
      ctrls.forEach((ctrl) => {
        const r = ctrl.getBoundingClientRect();
        if (r.height) h = Math.max(h, canvas.bottom - r.top);
      });
      return h;
    },
    stripHeight() {
      const strip = this.$refs.cardStrip;
      if (!strip || strip.hidden) return 0;
      return strip.getBoundingClientRect().height;
    },
    readMoreClearance() {
      const el = document.getElementById("map-read-more");
      if (!el) return 0;
      const h = el.getBoundingClientRect().height || this.readMoreH || 40;
      this.readMoreH = h;
      const bottom = parseFloat(getComputedStyle(el).bottom) || 24;
      const top = window.innerHeight - bottom - h;
      const mapBottom = this.$refs.canvas.getBoundingClientRect().bottom;
      return top < mapBottom ? mapBottom - top + 12 : 0;
    },
    stripOffset() {
      return Math.max(
        this.bottomControlsHeight() + 6,
        this.readMoreClearance(),
      );
    },
    pointInRing(pt, ring) {
      let inside = false;
      const x = pt[0],
        y = pt[1];
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i][0],
          yi = ring[i][1];
        const xj = ring[j][0],
          yj = ring[j][1];
        const intersect =
          yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    },
    pointInPolygon(pt, poly) {
      if (!this.pointInRing(pt, poly[0])) return false;
      for (let i = 1; i < poly.length; i++) {
        if (this.pointInRing(pt, poly[i])) return false;
      }
      return true;
    },
    pointInFeature(pt, feature) {
      const g = feature.geometry;
      if (!g) return false;
      if (g.type === "Polygon") return this.pointInPolygon(pt, g.coordinates);
      if (g.type === "MultiPolygon") {
        for (const p of g.coordinates) {
          if (this.pointInPolygon(pt, p)) return true;
        }
        return false;
      }
      return false;
    },
    escapeHTML(value) {
      const s = String(value ?? "");
      return s.replace(/[&<>"']/g, (c) => {
        const map = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        };
        return map[c];
      });
    },
    renderTooltipTemplate(template, properties) {
      return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key) => {
        return this.escapeHTML(properties ? properties[key] : "");
      });
    },
    showTooltipHTML(lon, lat, html, noPin = false) {
      this.hideTooltip();
      const tmpl = document.getElementById("map-tooltip-tmpl");
      const el = tmpl.content.cloneNode(true).firstElementChild;
      el.classList.add(
        "absolute",
        "z-40",
        "pointer-events-auto",
        "opacity-0",
        "transition-opacity",
        "duration-[180ms]",
        "left-(--tip-x)",
        "top-(--tip-y)",
        "ml-(--tip-shift)",
      );
      const rowsEl = el.querySelector("[data-rows]");
      rowsEl.innerHTML = html;
      this.tooltip = { el, lon, lat, noPin };
      this.$refs.canvas.closest("#map-container").appendChild(el);
      this.positionTooltip();
      requestAnimationFrame(() => {
        el.classList.replace("opacity-0", "opacity-100");
      });
    },
    showTooltip(lon, lat, feature, noPin = false) {
      const props = feature ? feature.properties : {};
      if (this.cardTemplates.length < 2) {
        const html = this.renderTooltipTemplate(this.tooltipTemplate, props);
        this.showTooltipHTML(lon, lat, html, noPin);
        return;
      }
      const html = this.cardTemplates
        .map((tmpl, i) => {
          const border = i ? " border-t border-g-3" : "";
          const col = this.renderTooltipTemplate(tmpl, props);
          return `<div class="min-w-0${border}">${col}</div>`;
        })
        .join("");
      this.showTooltipHTML(lon, lat, html, noPin);
      const card = this.tooltip.el.firstElementChild;
      card.classList.add("p-0!", "gap-0!", "overflow-hidden");
      const rows = card.querySelector("[data-rows]");
      rows.classList.add("gap-0!", "w-[min(320px,82vw)]");
      this.positionTooltip();
    },
    positionTooltip() {
      if (!this.tooltip || !this.map) return;
      const { el } = this.tooltip;
      if (!el.isConnected) {
        this.tooltip = null;
        return;
      }
      const pt = this.map.project([this.tooltip.lon, this.tooltip.lat]);
      el.style.setProperty("--tip-x", pt.x + "px");
      el.style.setProperty("--tip-y", pt.y + "px");
      el.style.setProperty("--tip-shift", "0px");
      el.style.setProperty("--caret-shift", "0px");
      let fallback = "";
      for (const placement of ["top", "bottom", "right", "left"]) {
        this.applyTooltipPlacement(placement);
        const rect = el.getBoundingClientRect();
        const clear = !this.overlapsSearchBar(rect);
        if (clear && this.fitsViewport(rect)) return;
        if (clear && !fallback) fallback = placement;
      }
      this.applyTooltipPlacement(fallback || "top");
      this.clampTooltipHorizontally();
    },
    clampTooltipHorizontally() {
      const { el } = this.tooltip;
      const placement = el.dataset.placement;
      if (placement !== "top" && placement !== "bottom") return;
      const margin = 8;
      const rect = el.getBoundingClientRect();
      let shift = 0;
      if (rect.width > window.innerWidth - margin * 2) {
        shift = margin - rect.left;
      } else if (rect.right > window.innerWidth - margin) {
        shift = window.innerWidth - margin - rect.right;
      } else if (rect.left < margin) {
        shift = margin - rect.left;
      }
      if (!shift) return;
      el.style.setProperty("--tip-shift", shift + "px");
      el.style.setProperty("--caret-shift", shift + "px");
      if (this.overlapsSearchBar(el.getBoundingClientRect())) {
        el.style.setProperty("--tip-shift", "0px");
        el.style.setProperty("--caret-shift", "0px");
      }
    },
    applyTooltipPlacement(placement) {
      const { el, noPin } = this.tooltip;
      const transforms = noPin
        ? {
            top: "-translate-x-1/2 -translate-y-[calc(100%+12px)]",
            bottom: "-translate-x-1/2 translate-y-3",
            right: "translate-x-3 -translate-y-1/2",
            left: "-translate-x-[calc(100%+12px)] -translate-y-1/2",
          }
        : {
            top: "-translate-x-1/2 -translate-y-[calc(100%+68px)]",
            bottom: "-translate-x-1/2 translate-y-3",
            right: "translate-x-10 -translate-y-[calc(50%+28px)]",
            left: "-translate-x-[calc(100%+40px)] -translate-y-[calc(50%+28px)]",
          };
      const carets = {
        top: "top-full left-[calc(50%-var(--caret-shift,0px))] -translate-x-1/2 border-t-white",
        bottom:
          "bottom-full left-[calc(50%-var(--caret-shift,0px))] -translate-x-1/2 border-b-white",
        right: "right-full top-1/2 -translate-y-1/2 border-r-white",
        left: "left-full top-1/2 -translate-y-1/2 border-l-white",
      };
      if (el.dataset.placementClasses) {
        el.classList.remove(...el.dataset.placementClasses.split(" "));
      }
      el.classList.add(...transforms[placement].split(" "));
      el.dataset.placementClasses = transforms[placement];
      el.dataset.placement = placement;
      const caret = el.querySelector("[data-caret]");
      if (caret) {
        caret.className =
          "absolute border-4 border-transparent drop-shadow-sm " +
          carets[placement];
      }
    },
    overlapsSearchBar(rect) {
      const bar = this.$refs.searchBar;
      if (!bar) return false;
      const b = bar.getBoundingClientRect();
      const pad = 8;
      return (
        rect.left < b.right + pad &&
        rect.right > b.left - pad &&
        rect.top < b.bottom + pad &&
        rect.bottom > b.top - pad
      );
    },
    fitsViewport(rect) {
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );
    },
    hideTooltip() {
      if (this.tooltip) {
        this.tooltip.el.remove();
        this.tooltip = null;
      }
    },
    dropPin(lon, lat, feature, fly = true) {
      if (this.marker) this.marker.remove();
      const el = document.createElement("div");
      el.className = "cursor-pointer";
      el.innerHTML =
        '<div data-pin class="-translate-y-11 scale-[0.55] opacity-0 drop-shadow-[0_4px_8px_rgba(0,0,0,0.28)]"><svg viewBox="0 0 40 56" width="40" height="56" xmlns="http://www.w3.org/2000/svg"><path d="M20 2C11.163 2 4 9.163 4 18c0 10.863 14.4 31.627 15.02 32.534a1.2 1.2 0 001.96 0C21.6 49.627 36 28.863 36 18 36 9.163 28.837 2 20 2z" fill="' +
        this.escapeHTML(this.mapColor) +
        '" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/><circle cx="20" cy="18" r="6" fill="#ffffff"/></svg></div>';
      el.addEventListener("click", () => this.showResult(lon, lat, feature));
      this.marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([lon, lat])
        .addTo(this.map);
      requestAnimationFrame(() => {
        el.querySelector("[data-pin]").className =
          "translate-y-0 scale-100 opacity-100 drop-shadow-[0_4px_8px_rgba(0,0,0,0.28)] transition-[translate,scale,opacity] duration-[450ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]";
        if (this.resultMode() === "popup") this.showResult(lon, lat, feature);
      });
      if (this.resultMode() !== "popup") this.showResult(lon, lat, feature);
      if (fly)
        this.map.flyTo({
          center: [lon, lat],
          zoom: 15,
          speed: 1.2,
          curve: 1.42,
          offset: [
            0,
            this.stripHeight()
              ? -(this.stripHeight() + this.stripOffset()) / 2
              : 0,
          ],
        });
    },
  };
}
