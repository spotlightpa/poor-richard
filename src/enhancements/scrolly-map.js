export default function scrollyMap(config) {
  let map = null;
  let stops = [];
  let observer = null;

  return {
    active: -1,
    mapColor: config.mapColor,
    colorOpacity: Number(config.colorOpacity),
    baseColor: config.baseColor,
    shadeProperty: config.shadeProperty || "shaded",
    layout: config.layout || "left",
    outline: config.outline !== false,
    outlineColor: config.outlineColor || "#2e2e2e",
    border: {
      edge: 1,
      edgeColor: "#bdbdbd",
      mat: 3,
      matColor: "#ffffff",
      shadows: [
        [1, 0.12],
        [3, 0.06],
      ],
    },
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    init() {
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
    snapshot: null,
    snapshotIndex() {
      const value = new URLSearchParams(window.location.search).get("snapshot");
      if (value === null) return null;
      const index = Math.max(0, (parseInt(value, 10) || 1) - 1);
      return Math.min(index, stops.length - 1);
    },
    enterSnapshot() {
      Object.assign(this.$root.style, {
        position: "fixed",
        inset: "0",
        zIndex: "9999",
        background: "#ffffff",
      });
      Object.assign(this.$refs.canvas.parentElement.style, {
        position: "absolute",
        inset: "0",
        height: "100%",
      });
      this.$refs.canvas.parentElement.nextElementSibling.style.visibility =
        "hidden";
      document.documentElement.style.overflow = "hidden";
    },
    initMap() {
      if (map) return;
      map = new window.maplibregl.Map({
        container: this.$refs.canvas,
        style: "https://tiles.openfreemap.org/styles/positron",
        center: [-77.6, 40.9],
        zoom: 6,
        interactive: false,
        attributionControl: { compact: true },
      });
      const ro = new ResizeObserver(() => {
        map.resize();
        this.fitActive(false);
      });
      ro.observe(this.$refs.canvas);
      map.on("load", () => {
        this.addAnchors();
        stops.forEach((stop) => this.loadStop(stop));
        this.observe();
      });
    },
    addAnchors() {
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
      let data = { type: "FeatureCollection", features: [] };
      if (stop.geojson) {
        try {
          const res = await fetch(stop.geojson);
          data = await res.json();
        } catch {
          return;
        }
      }
      const isPoint = (f) =>
        f.geometry &&
        (f.geometry.type === "Point" || f.geometry.type === "MultiPoint");
      const allFeatures = Array.isArray(data.features) ? data.features : [];
      const points = [...allFeatures.filter(isPoint), ...stop.dots];
      const features = allFeatures.filter((f) => !isPoint(f));
      data = { ...data, features: [...features, ...points] };
      stop.hasDots = points.length > 0;
      const prop = this.shadeProperty;
      const hasShade =
        stop.shade &&
        features.some((f) => f.properties && prop in f.properties);
      const shaded = hasShade
        ? features.filter((f) => f.properties && f.properties[prop] === true)
        : [];
      map.addSource(stop.id, { type: "geojson", data });
      if (this.outline) {
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
            "scrolly-anchor-outline",
          );
        });
        map.addLayer(
          {
            id: stop.id + "-outline",
            type: "line",
            source: stop.id + "-edge",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": this.border.edgeColor || this.outlineColor,
              "line-width": (this.border.mat + this.border.edge) * 2,
              "line-opacity": 0,
            },
          },
          "scrolly-anchor-outline",
        );
        map.addLayer(
          {
            id: stop.id + "-mat",
            type: "line",
            source: stop.id + "-edge",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": this.border.matColor,
              "line-width": this.border.mat * 2,
              "line-opacity": 0,
            },
          },
          "scrolly-anchor-outline",
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
      }
      map.addLayer(
        {
          id: stop.id + "-fill",
          type: "fill",
          source: stop.id,
          paint: {
            "fill-color": hasShade
              ? [
                  "case",
                  ["==", ["get", prop], true],
                  stop.color,
                  this.baseColor,
                ]
              : stop.shade
                ? stop.color
                : this.baseColor,
            "fill-opacity": 0,
            "fill-opacity-transition": { duration: 600, delay: 0 },
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
            "line-opacity-transition": { duration: 600, delay: 0 },
          },
        },
        "scrolly-anchor-fill",
      );

      if (stop.hasDots) this.addDots(stop);

      let fitTo = features.length ? features : points;
      if (stop.fit === "shaded" && shaded.length) fitTo = shaded;
      if (stop.fit === "dots" && points.length) fitTo = points;
      stop.bounds = this.boundsFor(fitTo);
      stop.ready = true;
      this.applyVisibility(stop);
      if (stop.index === this.active) this.fitActive(false);
    },
    addDots(stop) {
      const pointFilter = [
        "match",
        ["geometry-type"],
        ["Point", "MultiPoint"],
        true,
        false,
      ];
      const fade = { duration: 600, delay: 0 };
      map.addLayer({
        id: stop.id + "-dot-halo",
        type: "circle",
        source: stop.id,
        filter: pointFilter,
        paint: {
          "circle-radius": 12,
          "circle-color": this.outlineColor,
          "circle-opacity": 0,
          "circle-opacity-transition": fade,
        },
      });
      map.addLayer({
        id: stop.id + "-dot",
        type: "circle",
        source: stop.id,
        filter: pointFilter,
        paint: {
          "circle-radius": 6,
          "circle-color": this.outlineColor,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
          "circle-opacity": 0,
          "circle-stroke-opacity": 0,
          "circle-opacity-transition": fade,
          "circle-stroke-opacity-transition": fade,
        },
      });
      if (!map.getStyle().glyphs) return;
      map.addLayer({
        id: stop.id + "-dot-label",
        type: "symbol",
        source: stop.id,
        filter: pointFilter,
        layout: {
          "text-field": ["coalesce", ["get", "name"], ""],
          "text-font": ["Noto Sans Bold"],
          "text-size": 13,
          "text-variable-anchor": ["left", "right", "top", "bottom"],
          "text-radial-offset": 0.9,
          "text-justify": "auto",
        },
        paint: {
          "text-color": this.outlineColor,
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
          "text-opacity": 0,
          "text-opacity-transition": fade,
        },
      });
    },
    setActive(index, animate = true) {
      if (index === this.active) return;
      this.active = index;
      stops.forEach((stop) => {
        stop.el.toggleAttribute("data-active", stop.index === index);
        this.applyVisibility(stop);
      });
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
      const swap = { duration: 0, delay: on ? 0 : 600 };
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
      const pad = { top: 48, bottom: 48, left: 48, right: 48 };
      const width = this.$refs.canvas.clientWidth;
      const height = this.$refs.canvas.clientHeight;
      if (this.snapshot !== null) return pad;
      if (this.isMobile()) {
        pad.top = 24;
        pad.left = 16;
        pad.right = 16;
        pad.bottom = Math.round(height * 0.4);
        return pad;
      }
      if (this.layout === "center") return pad;
      const stop = stops[this.active];
      const card = stop ? stop.card : null;
      if (!card) return pad;
      const side = card.getBoundingClientRect().width + 80;
      if (width - side < 320) return pad;
      if (this.layout === "right") pad.right = side;
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
      const bounds = new window.maplibregl.LngLatBounds();
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
