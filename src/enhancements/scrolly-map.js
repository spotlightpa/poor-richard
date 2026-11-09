/* global maplibregl */

const FADE = { duration: 600, delay: 0 };

export default function scrollyMap(config) {
  let map = null;
  let stops = [];
  let observer = null;

  return {
    active: -1,
    mapColor: config.mapColor,
    colorOpacity: config.colorOpacity,
    baseColor: "#d9dde1",
    shadeProperty: config.shadeProperty || "shaded",
    basemap: config.basemap !== false,
    background: config.background || "#ffffff",
    outline: config.outline !== false,
    outlineColor: config.outlineColor || "#6b6b6b",
    dotColor: config.outlineColor || "#2e2e2e",
    border: {
      edge: 1.5,
      mat: 4,
      matColor: "#ffffff",
      shadows: [
        [1, 0.12],
        [3, 0.06],
      ],
    },
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    snapshot: null,
    init() {
      this.applyTheme();
      stops = Array.from(
        this.$root.querySelectorAll("[data-scrolly-stop]"),
      ).map((el, index) => ({
        el,
        card: el.querySelector("[data-scrolly-card]") || el,
        index,
        id: "scrolly-stop-" + index,
        geojson: el.dataset.geojson,
        color: el.dataset.color || this.mapColor,
        fit: el.dataset.fit || "all",
        align: el.dataset.align || config.layout || "left",
        dots: this.parseDots(el.dataset.dots),
        shade: el.dataset.shade !== "false",
        hasDots: false,
        bounds: null,
        ready: false,
      }));
      if (!stops.length) return;
      this.snapshot = this.snapshotIndex();
      if (this.snapshot !== null) this.enterSnapshot();
      if (window.maplibregl) {
        this.initMap();
        return;
      }
      const wait = setInterval(() => {
        if (window.maplibregl) {
          clearInterval(wait);
          this.initMap();
        }
      }, 50);
    },
    snapshotIndex() {
      const value = new URLSearchParams(window.location.search).get("snapshot");
      if (value === null) return null;
      const index = Math.max(0, (parseInt(value, 10) || 1) - 1);
      return Math.min(index, stops.length - 1);
    },
    enterSnapshot() {
      document.documentElement.classList.add("overflow-hidden");
    },
    applyTheme() {
      const opacity = parseFloat(this.colorOpacity);
      this.colorOpacity = Number.isFinite(opacity) ? opacity : 0.75;
    },
    rgb(color) {
      let hex = String(color || "").replace("#", "");
      if (hex.length === 3) {
        hex = hex
          .split("")
          .map((c) => c + c)
          .join("");
      }
      if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
      const n = parseInt(hex, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    },
    darken(color, amount) {
      const rgb = this.rgb(color);
      if (!rgb) return this.dotColor;
      return (
        "#" +
        rgb
          .map((c) =>
            Math.round(c * (1 - amount))
              .toString(16)
              .padStart(2, "0"),
          )
          .join("")
      );
    },
    initMap() {
      if (map) return;
      map = new maplibregl.Map({
        container: this.$refs.canvas,
        style: this.basemap
          ? "https://tiles.openfreemap.org/styles/positron"
          : {
              version: 8,
              glyphs:
                "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
              sources: {},
              layers: [
                {
                  id: "background",
                  type: "background",
                  paint: { "background-color": this.background },
                },
              ],
            },
        center: [-77.6, 40.9],
        zoom: 6,
        interactive: false,
      });
      const ro = new ResizeObserver(() => {
        map.resize();
        this.fitActive(false);
      });
      ro.observe(this.$refs.canvas);
      const header = document.querySelector("body > header");
      if (header) {
        new ResizeObserver(() => this.fitActive(true)).observe(header);
      }
      map.on("load", () => {
        this.addAnchors();
        stops.forEach((stop) => this.loadStop(stop));
        this.observe();
      });
    },
    addAnchors() {
      this.hideStateLabels();
      const firstSymbol = map
        .getStyle()
        .layers.find((layer) => layer.type === "symbol");
      const beforeId = firstSymbol ? firstSymbol.id : undefined;
      map.addSource("scrolly-anchor", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      [
        "scrolly-anchor-outline",
        "scrolly-anchor-base",
        "scrolly-anchor-fill",
      ].forEach((id) => {
        map.addLayer({ id, type: "line", source: "scrolly-anchor" }, beforeId);
      });
    },
    hideStateLabels() {
      map.getStyle().layers.forEach((layer) => {
        if (layer.type === "symbol" && /state/i.test(layer.id)) {
          map.setLayoutProperty(layer.id, "visibility", "none");
        }
      });
    },
    isMobile() {
      return this.$refs.canvas.clientWidth < 768;
    },
    observe() {
      if (this.snapshot !== null) {
        this.setActive(this.snapshot, false);
        return;
      }
      this.setActive(0, false);
      const line = this.isMobile() ? 88 : 50;
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const stop = stops.find((s) => s.card === entry.target);
            if (stop) this.setActive(stop.index);
          });
        },
        { rootMargin: `-${line}% 0px -${100 - line}% 0px` },
      );
      stops.forEach((stop) => observer.observe(stop.card));
    },
    parseDots(value) {
      if (!value) return [];
      return value
        .split(";")
        .map((entry) => {
          const [name, coords = ""] = entry.split(":");
          const [lat, lng] = coords.split(",").map((n) => parseFloat(n));
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
          return {
            type: "Feature",
            properties: { name: name.trim() },
            geometry: { type: "Point", coordinates: [lng, lat] },
          };
        })
        .filter(Boolean);
    },
    async loadStop(stop) {
      if (!stop.geojson && !stop.dots.length) return;
      const data = await this.fetchStop(stop);
      if (!data) return;
      const isPoint = (f) =>
        f.geometry &&
        (f.geometry.type === "Point" || f.geometry.type === "MultiPoint");
      const allFeatures = Array.isArray(data.features) ? data.features : [];
      const points = [...allFeatures.filter(isPoint), ...stop.dots];
      const features = allFeatures.filter((f) => !isPoint(f));
      const prop = this.shadeProperty;
      const hasShade =
        stop.shade &&
        features.some((f) => f.properties && prop in f.properties);
      const shaded = hasShade
        ? features.filter((f) => f.properties && f.properties[prop] === true)
        : [];
      stop.hasDots = points.length > 0;
      map.addSource(stop.id, { type: "geojson", data: { ...data, features } });
      if (this.outline) this.addOutlineLayers(stop, features);
      this.addFillLayers(stop, hasShade);
      if (shaded.length) this.addRegionLayer(stop, shaded);
      if (stop.hasDots) this.addDots(stop, points);
      let fitTo = features.length ? features : points;
      if (stop.fit === "shaded" && shaded.length) fitTo = shaded;
      if (stop.fit === "dots" && points.length) fitTo = points;
      stop.bounds = this.boundsFor(fitTo);
      stop.ready = true;
      this.applyVisibility(stop);
      if (stop.index === this.active) this.fitActive(false);
    },
    async fetchStop(stop) {
      if (!stop.geojson) return { type: "FeatureCollection", features: [] };
      try {
        const res = await fetch(stop.geojson);
        return await res.json();
      } catch {
        return null;
      }
    },
    addOutlineLayers(stop, features) {
      const before = "scrolly-anchor-outline";
      map.addSource(stop.id + "-edge", {
        type: "geojson",
        data: this.boundaryFor(features),
      });
      this.border.shadows.forEach(([offset], n) => {
        map.addLayer(
          {
            id: stop.id + "-shadow-" + n,
            type: "fill",
            source: stop.id,
            paint: {
              "fill-color": "#000000",
              "fill-antialias": false,
              "fill-translate": [0, offset],
              "fill-opacity": 0,
            },
          },
          before,
        );
      });
      const edgeLine = (id, color, width) => ({
        id,
        type: "line",
        source: stop.id + "-edge",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": color, "line-width": width, "line-opacity": 0 },
      });
      map.addLayer(
        edgeLine(
          stop.id + "-outline",
          this.outlineColor,
          (this.border.mat + this.border.edge) * 2,
        ),
        before,
      );
      map.addLayer(
        edgeLine(stop.id + "-mat", this.border.matColor, this.border.mat * 2),
        before,
      );
      map.addLayer(
        {
          id: stop.id + "-base",
          type: "fill",
          source: stop.id,
          paint: { "fill-color": "#ffffff", "fill-opacity": 0 },
        },
        "scrolly-anchor-base",
      );
    },
    addFillLayers(stop, hasShade) {
      const prop = this.shadeProperty;
      let fill = stop.shade ? stop.color : this.baseColor;
      if (hasShade) {
        fill = [
          "case",
          ["==", ["get", prop], true],
          stop.color,
          this.baseColor,
        ];
      }
      map.addLayer(
        {
          id: stop.id + "-fill",
          type: "fill",
          source: stop.id,
          paint: {
            "fill-color": fill,
            "fill-opacity": 0,
            "fill-opacity-transition": FADE,
          },
        },
        "scrolly-anchor-fill",
      );
      map.addLayer(
        {
          id: stop.id + "-line",
          type: "line",
          source: stop.id,
          paint: {
            "line-color": "#ffffff",
            "line-width": 1,
            "line-opacity": 0,
            "line-opacity-transition": FADE,
          },
        },
        "scrolly-anchor-fill",
      );
    },
    addRegionLayer(stop, shaded) {
      map.addSource(stop.id + "-region", {
        type: "geojson",
        data: this.boundaryFor(shaded),
      });
      map.addLayer(
        {
          id: stop.id + "-region",
          type: "line",
          source: stop.id + "-region",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": this.darken(stop.color, 0.35),
            "line-width": 1.75,
            "line-opacity": 0,
            "line-opacity-transition": FADE,
          },
        },
        "scrolly-anchor-fill",
      );
    },
    addDots(stop, points) {
      const source = stop.id + "-points";
      map.addSource(source, {
        type: "geojson",
        data: { type: "FeatureCollection", features: points },
      });
      map.addLayer({
        id: stop.id + "-dot-halo",
        type: "circle",
        source,
        paint: {
          "circle-radius": 12,
          "circle-color": this.dotColor,
          "circle-opacity": 0,
          "circle-opacity-transition": FADE,
        },
      });
      map.addLayer({
        id: stop.id + "-dot",
        type: "circle",
        source,
        paint: {
          "circle-radius": 6,
          "circle-color": this.dotColor,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
          "circle-opacity": 0,
          "circle-stroke-opacity": 0,
          "circle-opacity-transition": FADE,
          "circle-stroke-opacity-transition": FADE,
        },
      });
      if (!map.getStyle().glyphs) return;
      map.addLayer({
        id: stop.id + "-dot-label",
        type: "symbol",
        source,
        layout: {
          "text-field": ["coalesce", ["get", "name"], ""],
          "text-font": ["Noto Sans Bold"],
          "text-size": 13,
          "text-variable-anchor": ["left", "right", "top", "bottom"],
          "text-radial-offset": 0.9,
          "text-justify": "auto",
        },
        paint: {
          "text-color": this.dotColor,
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
          "text-opacity": 0,
          "text-opacity-transition": FADE,
        },
      });
    },
    setActive(index, animate = true) {
      if (index === this.active) return;
      this.active = index;
      stops.forEach((stop) => this.applyVisibility(stop));
      this.fitActive(animate);
    },
    applyVisibility(stop) {
      if (!map || !stop.ready) return;
      const on = stop.index === this.active;
      map.setPaintProperty(
        stop.id + "-fill",
        "fill-opacity",
        on ? this.colorOpacity : 0,
      );
      map.setPaintProperty(stop.id + "-line", "line-opacity", on ? 1 : 0);
      if (map.getLayer(stop.id + "-region")) {
        map.setPaintProperty(stop.id + "-region", "line-opacity", on ? 1 : 0);
      }
      if (stop.hasDots) {
        [
          [stop.id + "-dot-halo", "circle-opacity", 0.18],
          [stop.id + "-dot", "circle-opacity", 1],
          [stop.id + "-dot", "circle-stroke-opacity", 1],
          [stop.id + "-dot-label", "text-opacity", 1],
        ].forEach(([id, prop, value]) => {
          if (map.getLayer(id)) map.setPaintProperty(id, prop, on ? value : 0);
        });
      }
      if (!this.outline) return;
      const swap = { duration: 0, delay: on ? 0 : FADE.duration };
      [
        ...this.border.shadows.map(([, value], n) => [
          stop.id + "-shadow-" + n,
          "fill-opacity",
          value,
        ]),
        [stop.id + "-mat", "line-opacity", 1],
        [stop.id + "-outline", "line-opacity", 1],
        [stop.id + "-base", "fill-opacity", 1],
      ].forEach(([id, prop, value]) => {
        map.setPaintProperty(id, prop + "-transition", swap);
        map.setPaintProperty(id, prop, on ? value : 0);
      });
    },
    fitActive(animate) {
      const stop = stops[this.active];
      if (!map || !stop || !stop.bounds) return;
      map.fitBounds(stop.bounds, {
        padding: this.padding(),
        duration: animate && !this.reduceMotion ? 1200 : 0,
        maxZoom: 9,
      });
    },
    padding() {
      const pad = { top: 40, bottom: 40, left: 48, right: 48 };
      const width = this.$refs.canvas.clientWidth;
      const height = this.$refs.canvas.clientHeight;
      if (this.snapshot !== null) return pad;
      const header = document.querySelector("body > header");
      const covered = header
        ? Math.max(0, Math.round(header.getBoundingClientRect().bottom))
        : 0;
      pad.top += covered;
      if (this.isMobile()) {
        pad.top = 24 + covered;
        pad.left = 16;
        pad.right = 16;
        pad.bottom = Math.round(height * 0.4);
        return pad;
      }
      const stop = stops[this.active];
      if (!stop || stop.align === "center") return pad;
      const side = stop.card.getBoundingClientRect().width + 100;
      if (width - side < 320) return pad;
      if (stop.align === "right") pad.right = side;
      else pad.left = side;
      return pad;
    },
    boundaryFor(features) {
      const key = (p) => p[0].toFixed(6) + "," + p[1].toFixed(6);
      const counts = new Map();
      const rings = [];
      features.forEach((f) => {
        if (!f.geometry) return;
        const { type, coordinates } = f.geometry;
        if (type === "Polygon") rings.push(...coordinates);
        if (type === "MultiPolygon")
          coordinates.forEach((p) => rings.push(...p));
      });
      rings.forEach((ring) => {
        for (let i = 1; i < ring.length; i++) {
          const a = key(ring[i - 1]);
          const b = key(ring[i]);
          if (a === b) continue;
          const k = a < b ? a + "|" + b : b + "|" + a;
          counts.set(k, (counts.get(k) || 0) + 1);
        }
      });
      const lines = [];
      rings.forEach((ring) => {
        let current = [];
        for (let i = 1; i < ring.length; i++) {
          const a = key(ring[i - 1]);
          const b = key(ring[i]);
          const k = a < b ? a + "|" + b : b + "|" + a;
          if (a !== b && counts.get(k) === 1) {
            if (!current.length) current.push(ring[i - 1]);
            current.push(ring[i]);
          } else if (current.length) {
            lines.push(current);
            current = [];
          }
        }
        if (current.length) lines.push(current);
      });
      return {
        type: "Feature",
        properties: {},
        geometry: { type: "MultiLineString", coordinates: lines },
      };
    },
    boundsFor(features) {
      const bounds = new maplibregl.LngLatBounds();
      const extend = (coords) => {
        if (!Array.isArray(coords) || coords.length === 0) return;
        if (typeof coords[0] === "number") {
          bounds.extend([coords[0], coords[1]]);
          return;
        }
        coords.forEach(extend);
      };
      features.forEach((f) => {
        if (f.geometry) extend(f.geometry.coordinates);
      });
      return bounds.isEmpty() ? null : bounds;
    },
  };
}
