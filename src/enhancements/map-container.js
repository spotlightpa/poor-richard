/* global maplibregl */

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
    districtsData: null,
    searchQuery: "",
    isSearching: false,
    isLocating: false,
    errorState: false,
    marker: null,
    tooltip: null,
    init() {
      const main = document.querySelector("main[data-ga-category=main]");
      if (main) main.style.minHeight = "100dvh";
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
      this.navIsMd = window.matchMedia("(min-width: 768px)").matches;
      this.map.addControl(
        this.navControl,
        this.navIsMd ? "top-right" : "bottom-right",
      );
      window.addEventListener("resize", () => this.updateNavPosition());
      const ro = new ResizeObserver(() => this.map && this.map.resize());
      ro.observe(this.$refs.canvas);
      this.map.on("load", () => this.loadGeoJSON());
      this.map.on("move", () => this.positionTooltip());
    },
    updateNavPosition() {
      const isMd = window.matchMedia("(min-width: 768px)").matches;
      if (isMd === this.navIsMd || !this.map) return;
      this.navIsMd = isMd;
      this.map.removeControl(this.navControl);
      this.map.addControl(this.navControl, isMd ? "top-right" : "bottom-right");
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

      this.map.on("click", "shapes-fill", (e) => {
        if (!this.tooltipsEnabled || !this.tooltipTemplate) return;
        const feature = e.features && e.features[0];
        if (!feature) return;
        const lon = e.lngLat.lng;
        const lat = e.lngLat.lat;
        const html = this.renderTooltipTemplate(
          this.tooltipTemplate,
          feature.properties,
        );
        if (this.marker) {
          this.marker.remove();
          this.marker = null;
        }
        this.hideTooltip();
        this.showTooltipHTML(lon, lat, html, true);
      });

      this.map.on("mousemove", "shapes-fill", () => {
        this.map.getCanvas().style.cursor = "pointer";
      });
      this.map.on("mouseleave", "shapes-fill", () => {
        this.map.getCanvas().style.cursor = "";
      });

      this.fitToData(data);
      this.loadCustomCode();
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
      this.hideTooltip();
      this.searchQuery = "";
      this.errorState = false;
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
      el.style.cssText =
        "position:absolute;z-index:40;pointer-events:auto;opacity:0;transition:opacity 0.18s ease;";
      const rowsEl = el.querySelector("[data-rows]");
      rowsEl.innerHTML = html;
      this.tooltip = { el, lon, lat, noPin };
      this.$refs.canvas.closest("#map-container").appendChild(el);
      this.positionTooltip();
      requestAnimationFrame(() => {
        el.style.opacity = "1";
      });
    },
    showTooltip(lon, lat, feature, noPin = false) {
      const html = this.renderTooltipTemplate(
        this.tooltipTemplate || "",
        feature ? feature.properties : {},
      );
      this.showTooltipHTML(lon, lat, html, noPin);
    },
    positionTooltip() {
      if (!this.tooltip || !this.map) return;
      const { el } = this.tooltip;
      if (!el.isConnected) {
        this.tooltip = null;
        return;
      }
      const pt = this.map.project([this.tooltip.lon, this.tooltip.lat]);
      el.style.left = pt.x + "px";
      el.style.top = pt.y + "px";
      el.style.marginLeft = "0px";
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
      el.style.marginLeft = shift + "px";
      const caret = el.querySelector("[data-caret]");
      if (caret) caret.style.left = `calc(50% - ${shift}px)`;
      if (this.overlapsSearchBar(el.getBoundingClientRect())) {
        el.style.marginLeft = "0px";
        if (caret) caret.style.left = "50%";
      }
    },
    applyTooltipPlacement(placement) {
      const { el, noPin } = this.tooltip;
      const gap = 12;
      const pinHeight = noPin ? 0 : 56;
      const pinMid = pinHeight / 2;
      const transforms = {
        top: `translate(-50%, calc(-100% - ${gap + pinHeight}px))`,
        bottom: `translate(-50%, ${gap}px)`,
        right: `translate(${gap + pinMid}px, calc(-50% - ${pinMid}px))`,
        left: `translate(calc(-100% - ${gap + pinMid}px), calc(-50% - ${pinMid}px))`,
      };
      const carets = {
        top: "top:100%;left:50%;transform:translateX(-50%);border-top-color:#fff;",
        bottom:
          "bottom:100%;left:50%;transform:translateX(-50%);border-bottom-color:#fff;",
        right:
          "right:100%;top:50%;transform:translateY(-50%);border-right-color:#fff;",
        left: "left:100%;top:50%;transform:translateY(-50%);border-left-color:#fff;",
      };
      el.style.transform = transforms[placement];
      el.dataset.placement = placement;
      const caret = el.querySelector("[data-caret]");
      if (caret) caret.style.cssText = carets[placement];
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
      el.style.cssText =
        "cursor:pointer;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.28));opacity:0;transform:translateY(-44px) scale(0.55);transition:none;";
      el.innerHTML =
        '<svg viewBox="0 0 40 56" width="40" height="56" xmlns="http://www.w3.org/2000/svg"><path d="M20 2C11.163 2 4 9.163 4 18c0 10.863 14.4 31.627 15.02 32.534a1.2 1.2 0 001.96 0C21.6 49.627 36 28.863 36 18 36 9.163 28.837 2 20 2z" fill="' +
        this.escapeHTML(this.mapColor) +
        '" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/><circle cx="20" cy="18" r="6" fill="#ffffff"/></svg>';
      el.addEventListener("click", () => this.showTooltip(lon, lat, feature));
      this.marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([lon, lat])
        .addTo(this.map);
      requestAnimationFrame(() => {
        el.style.cssText =
          "cursor:pointer;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.28));opacity:1;transform:translateY(0) scale(1);transition:transform 0.45s cubic-bezier(0.34,1.56,0.64,1),opacity 0.2s ease;";
        this.showTooltip(lon, lat, feature);
      });
      if (fly)
        this.map.flyTo({
          center: [lon, lat],
          zoom: 15,
          speed: 1.2,
          curve: 1.42,
        });
    },
  };
}
