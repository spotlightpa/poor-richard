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
        stops.forEach((stop) => this.loadStop(stop));
        this.observe();
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
    async loadStop(stop) {
      if (!stop.geojson) return;
      let data;
      try {
        const res = await fetch(stop.geojson);
        data = await res.json();
      } catch {
        return;
      }
      const features = Array.isArray(data.features) ? data.features : [];
      const prop = this.shadeProperty;
      const hasShade = features.some(
        (f) => f.properties && prop in f.properties,
      );
      const shaded = hasShade
        ? features.filter((f) => f.properties && f.properties[prop] === true)
        : [];
      const firstSymbol = map
        .getStyle()
        .layers.find((layer) => layer.type === "symbol");
      const beforeId = firstSymbol ? firstSymbol.id : undefined;

      map.addSource(stop.id, { type: "geojson", data });
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
              : stop.color,
            "fill-opacity": 0,
            "fill-opacity-transition": { duration: 600, delay: 0 },
          },
        },
        beforeId,
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
        beforeId,
      );

      const useShaded = stop.fit === "shaded" && shaded.length > 0;
      stop.bounds = this.boundsFor(useShaded ? shaded : features);
      stop.ready = true;
      this.applyVisibility(stop);
      if (stop.index === this.active) this.fitActive(false);
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
