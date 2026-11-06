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
    const icon = document.getElementById("map-reset-icon");
    if (icon)
      button.appendChild(icon.content.firstElementChild.cloneNode(true));
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
    cards: [],
    shownMode: "",
    stripNarrow: false,
    activeCard: 0,
    hovering: false,
    mapFitted: false,
    tipOpen: false,
    tipPlacement: "top",
    tipNoPin: true,
    tipStacked: false,
    tipSections: [],
    pinDropped: false,
    init() {
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
        this.hovering = this.resultMode() !== "none";
      });
      this.map.on("mouseleave", "shapes-fill", () => {
        this.hovering = false;
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
        const results = await this.geocode(q);
        let match = this.matchResults(results);
        if (!match && !this.namesPlace(q, results)) {
          const lower = q.toLowerCase();
          for (const name of await this.areaNames()) {
            if (lower.includes(name.toLowerCase())) continue;
            match = this.matchResults(await this.geocode(`${q}, ${name}`));
            if (match) break;
          }
        }
        if (!match) {
          this.fail();
          return;
        }
        this.dropPin(match.lon, match.lat, match.feature);
      } catch {
        this.fail();
      } finally {
        this.isSearching = false;
      }
    },
    async geocode(address) {
      const url =
        "https://viz-sample-ballot-2024.data.spotlightpa.org/api/geolocate?address=" +
        encodeURIComponent(address);
      const res = await fetch(url);
      const data = await res.json();
      return data?.results || [];
    },
    matchResults(results) {
      if (!this.districtsData) return null;
      for (const result of results) {
        const loc = result?.geometry?.location;
        if (!loc || !this.isSpecificPlace(result)) continue;
        const feature = this.districtsData.features.find((f) =>
          this.pointInFeature([loc.lng, loc.lat], f),
        );
        if (feature) return { lon: loc.lng, lat: loc.lat, feature };
      }
      return null;
    },
    namesPlace(query, results) {
      const lower = query.toLowerCase();
      if (/\b\d{5}\b/.test(query)) return true;
      const parts = lower.split(",").map((part) => part.trim());
      const unit = /^(?:#|(?:apt|apartment|unit|suite|ste|fl|floor|rm|room)\b)/;
      if (parts.slice(1).some((part) => part && !unit.test(part))) return true;
      const placeTypes = [
        "locality",
        "administrative_area_level_2",
        "administrative_area_level_3",
      ];
      return results.some((result) =>
        (result.address_components || []).some(
          (part) =>
            (part.types || []).some((type) => placeTypes.includes(type)) &&
            part.long_name &&
            lower.includes(part.long_name.toLowerCase()),
        ),
      );
    },
    isSpecificPlace(result) {
      if (result?.geometry?.location_type === "APPROXIMATE") return false;
      const area = [
        "political",
        "country",
        "administrative_area_level_1",
        "administrative_area_level_2",
        "administrative_area_level_3",
        "locality",
        "sublocality",
        "sublocality_level_1",
        "neighborhood",
        "colloquial_area",
        "postal_code",
      ];
      const types = result?.types || [];
      return !types.length || types.some((type) => !area.includes(type));
    },
    areaNames() {
      if (!this.areaNamesPromise) {
        this.areaNamesPromise = this.lookupAreaNames().catch(() => {
          this.areaNamesPromise = null;
          return [];
        });
      }
      return this.areaNamesPromise;
    },
    async lookupAreaNames() {
      if (!this.districtsData) return [];
      const bounds = this.dataBounds(this.districtsData);
      if (bounds.isEmpty()) return [];
      const center = bounds.getCenter();
      const url =
        "https://viz-sample-ballot-2024.data.spotlightpa.org/api/geolocate?latlng=" +
        encodeURIComponent(`${center.lat},${center.lng}`);
      const res = await fetch(url);
      const data = await res.json();
      const pick = (type) => {
        for (const result of data?.results || []) {
          for (const part of result.address_components || []) {
            if (part.types && part.types.includes(type)) return part.long_name;
          }
        }
        return "";
      };
      const names = [pick("locality"), pick("administrative_area_level_2")];
      return names.filter((name, i) => name && names.indexOf(name) === i);
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
      if (!this.tooltipsEnabled) return "none";
      const cards = this.isMd() ? this.desktopCards : this.mobileCards;
      if (cards && this.cardTemplates.length) {
        return this.isMd() ? "strip" : "section";
      }
      return this.tooltipTemplate ? "popup" : "none";
    },
    async showResult(lon, lat, feature, noPin = false) {
      this.lastResult = { lon, lat, feature, noPin };
      const mode = this.resultMode();
      this.hideTooltip();
      this.hideCards();
      if (mode === "popup") {
        await this.showTooltip(lon, lat, feature, noPin);
      } else if (mode !== "none") {
        await this.showCards(mode, feature);
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
    async showCards(mode, feature) {
      const props = feature ? feature.properties : {};
      this.cards = this.cardTemplates.map((tmpl) =>
        this.renderTooltipTemplate(tmpl, props),
      );
      this.activeCard = 0;
      this.shownMode = mode;
      await this.$nextTick();
      if (this.$refs.cardTrack) this.$refs.cardTrack.scrollLeft = 0;
      this.layoutCards();
      await this.$nextTick();
      if (mode === "section") await this.fitSection();
    },
    async fitSection() {
      const section = document.getElementById("map-card-section");
      const map = this.$refs.canvas.closest("#map-container");
      if (!section) return;
      const mapTop = map.getBoundingClientRect().top;
      const sectionH = section.getBoundingClientRect().height;
      if (mapTop >= 0 && mapTop < 80) {
        const room = window.innerHeight - mapTop - sectionH;
        if (room < map.getBoundingClientRect().height) {
          map.style.setProperty(
            "--map-fit-h",
            Math.max(320, Math.floor(room)) + "px",
          );
          this.mapFitted = true;
          await this.$nextTick();
          this.map.resize();
        }
      }
      const r = section.getBoundingClientRect();
      if (r.bottom <= window.innerHeight + 1) return;
      const top = window.scrollY + r.bottom - window.innerHeight;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    },
    resetMapHeight() {
      if (!this.mapFitted) return;
      this.mapFitted = false;
      this.$refs.canvas
        .closest("#map-container")
        .style.removeProperty("--map-fit-h");
      this.$nextTick(() => this.map && this.map.resize());
    },
    layoutCards() {
      const strip = this.$refs.cardStrip;
      if (!strip || this.shownMode !== "strip") return;
      strip.style.setProperty("--strip-bottom", this.stripOffset() + "px");
      const stripWidth = this.$refs.canvas.getBoundingClientRect().width - 32;
      this.stripNarrow = this.cards.length > 1 && stripWidth < 740;
    },
    hideCards() {
      this.shownMode = "";
      this.cards = [];
      this.resetMapHeight();
    },
    cardElements() {
      const track = this.$refs.cardTrack;
      return track ? [...track.querySelectorAll(":scope > div")] : [];
    },
    onCardScroll() {
      const cards = this.cardElements();
      if (cards.length < 2) return;
      const step = cards[1].offsetLeft - cards[0].offsetLeft;
      this.activeCard = Math.round(this.$refs.cardTrack.scrollLeft / step);
    },
    showCard(i) {
      const cards = this.cardElements();
      if (!cards[i]) return;
      this.$refs.cardTrack.scrollTo({
        left: cards[i].offsetLeft - cards[0].offsetLeft,
        behavior: "smooth",
      });
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
      if (!strip || this.shownMode !== "strip") return 0;
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
    async showTooltip(lon, lat, feature, noPin = false) {
      const props = feature ? feature.properties : {};
      const stacked = this.cardTemplates.length > 1;
      this.tipSections = stacked
        ? this.cardTemplates.map((tmpl) =>
            this.renderTooltipTemplate(tmpl, props),
          )
        : [this.renderTooltipTemplate(this.tooltipTemplate || "", props)];
      this.tipStacked = stacked;
      this.tipNoPin = noPin;
      this.tooltip = { lon, lat, noPin };
      this.tipOpen = true;
      await this.$nextTick();
      this.positionTooltip();
    },
    tooltipRect(placement, x, y, w, h) {
      const gap = 12;
      const pin = this.tooltip.noPin ? 0 : 56;
      const mid = pin / 2;
      const origins = {
        top: [x - w / 2, y - h - gap - pin],
        bottom: [x - w / 2, y + gap],
        right: [x + gap + mid, y - h / 2 - mid],
        left: [x - w - gap - mid, y - h / 2 - mid],
      };
      const [left, top] = origins[placement];
      return { left, top, right: left + w, bottom: top + h };
    },
    positionTooltip() {
      if (!this.tipOpen || !this.tooltip || !this.map) return;
      const el = this.$refs.tooltip;
      const pt = this.map.project([this.tooltip.lon, this.tooltip.lat]);
      el.style.setProperty("--tip-x", pt.x + "px");
      el.style.setProperty("--tip-y", pt.y + "px");
      el.style.setProperty("--tip-shift", "0px");
      el.style.setProperty("--caret-shift", "0px");
      const c = this.$refs.canvas.getBoundingClientRect();
      const x = c.left + pt.x;
      const y = c.top + pt.y;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      let fallback = "";
      for (const placement of ["top", "bottom", "right", "left"]) {
        const rect = this.tooltipRect(placement, x, y, w, h);
        const clear = !this.overlapsSearchBar(rect);
        if (clear && this.fitsViewport(rect)) {
          this.tipPlacement = placement;
          return;
        }
        if (clear && !fallback) fallback = placement;
      }
      this.tipPlacement = fallback || "top";
      this.clampTooltipHorizontally(
        this.tooltipRect(this.tipPlacement, x, y, w, h),
      );
    },
    clampTooltipHorizontally(rect) {
      if (this.tipPlacement !== "top" && this.tipPlacement !== "bottom") return;
      const margin = 8;
      const width = rect.right - rect.left;
      let shift = 0;
      if (width > window.innerWidth - margin * 2) {
        shift = margin - rect.left;
      } else if (rect.right > window.innerWidth - margin) {
        shift = window.innerWidth - margin - rect.right;
      } else if (rect.left < margin) {
        shift = margin - rect.left;
      }
      if (!shift) return;
      const shifted = {
        ...rect,
        left: rect.left + shift,
        right: rect.right + shift,
      };
      if (this.overlapsSearchBar(shifted)) return;
      const el = this.$refs.tooltip;
      el.style.setProperty("--tip-shift", shift + "px");
      el.style.setProperty("--caret-shift", shift + "px");
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
      this.tipOpen = false;
      this.tooltip = null;
    },
    async dropPin(lon, lat, feature, fly = true) {
      if (this.marker) this.marker.remove();
      this.pinDropped = false;
      const tmpl = document.getElementById("map-pin");
      const el = tmpl.content.firstElementChild.cloneNode(true);
      el.addEventListener("click", () => this.showResult(lon, lat, feature));
      this.marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([lon, lat])
        .addTo(this.map);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.pinDropped = true;
        });
        if (this.resultMode() === "popup") this.showResult(lon, lat, feature);
      });
      if (this.resultMode() !== "popup")
        await this.showResult(lon, lat, feature);
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
