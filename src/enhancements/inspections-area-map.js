export const AREA_LIMIT = 300;

export const LEVEL_COLORS = {
  high: "#D70000",
  moderate: "#FFCB03",
  low: "#009EDB",
  none: "#1b998b",
};

const LEVELS = ["high", "moderate", "low", "none"];

function pinSVG(level, selected) {
  const size = selected ? 36 : 26;
  const color = LEVEL_COLORS[level] || LEVEL_COLORS.none;
  const ring = selected
    ? `<circle cx="12" cy="12" r="11.6" fill="#111" />`
    : "";
  const shape =
    level === "none"
      ? `<circle cx="12" cy="12" r="${selected ? 8.4 : 10}" fill="${color}" stroke="#fff" stroke-width="2" /><path d="M8.6 12.1l2.3 2.3 4.5-4.6" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" />`
      : `<path d="${selected ? "M12 3.6L20.4 12L12 20.4L3.6 12Z" : "M12 1.5L22.5 12L12 22.5L1.5 12Z"}" fill="${color}" stroke="#fff" stroke-width="2" />`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${ring}${shape}</svg>`;
}

function clusterSize(total) {
  return Math.round(Math.min(48, 28 + Math.sqrt(total) * 0.4));
}

function abbreviate(n) {
  if (n >= 10000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(Math.round(n / 100) / 10).toString()}k`;
  return String(n);
}

function clusterSVG(props) {
  const total = props.point_count || 0;
  const size = clusterSize(total);
  const stroke = Math.max(5, Math.round(size * 0.17));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const parts = LEVELS.map((k) => [k, props[k] || 0]).filter(([, v]) => v > 0);
  const gap = parts.length > 1 ? 1.5 : 0;
  let offset = 0;
  const arcs = parts
    .map(([k, v]) => {
      const len = (v / total) * c;
      const arc = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${LEVEL_COLORS[k]}" stroke-width="${stroke}" stroke-dasharray="${Math.max(len - gap, 0.5)} ${c}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${size / 2} ${size / 2})" />`;
      offset += len;
      return arc;
    })
    .join("");
  const label = abbreviate(total);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 0.5}" fill="#fff" />${arcs}<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="${size > 44 ? 13 : 11}" fill="#111">${label}</text></svg>`;
}

const CELL = 64;
const MARGIN = 40;
const MERGE_BELOW_ZOOM = 15;

function mercX(lon) {
  return (lon + 180) / 360;
}

function mercY(lat) {
  const s = Math.sin((lat * Math.PI) / 180);
  return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI);
}

export function createAreaMap(map, { onPick }) {
  const maplibregl = window.maplibregl;
  const markers = new Map();
  let selected = "";
  let points = [];

  map.dragRotate.disable();
  map.touchZoomRotate.disableRotation();
  map.touchPitch.disable();
  map.keyboard.disableRotation();

  const makePin = (p) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "block cursor-pointer";
    el.setAttribute("aria-label", p.name);
    el.dataset.level = p.w;
    el.innerHTML = pinSVG(p.w, p.id === selected);
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      onPick(p.id);
    });
    return new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat([
      p.lon,
      p.lat,
    ]);
  };

  const makeCluster = (c, lngLat) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "block cursor-pointer";
    el.setAttribute(
      "aria-label",
      `${c.count.toLocaleString()} facilities. Zoom in`,
    );
    el.innerHTML = clusterSVG({ point_count: c.count, ...c.levels });
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const bounds = new maplibregl.LngLatBounds(
        [c.west, c.south],
        [c.east, c.north],
      );
      const zoom = map.cameraForBounds(bounds, { padding: 60 })?.zoom ?? 0;
      map.easeTo({
        center: bounds.getCenter(),
        zoom: Math.min(16, Math.max(zoom, map.getZoom() + 1)),
      });
    });
    return new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat(
      lngLat,
    );
  };

  const layout = () => {
    const canvas = map.getCanvas();
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return null;
    const zoom = map.getZoom();
    const world = 512 * Math.pow(2, zoom);
    const origin = map.project([0, 0]);
    const ox = origin.x - 0.5 * world;
    const oy = origin.y - 0.5 * world;
    const merge = zoom < MERGE_BELOW_ZOOM;
    const cells = new Map();
    const items = [];
    for (const p of points) {
      const x = mercX(p.lon) * world + ox;
      const y = mercY(p.lat) * world + oy;
      if (
        x < -MARGIN ||
        y < -MARGIN ||
        x > width + MARGIN ||
        y > height + MARGIN
      )
        continue;
      if (!merge) {
        items.push({ point: p, x, y, r: 13, count: 1 });
        continue;
      }
      const key = `${Math.floor(x / CELL)},${Math.floor(y / CELL)}`;
      let c = cells.get(key);
      if (!c) {
        c = {
          count: 0,
          sx: 0,
          sy: 0,
          levels: { high: 0, moderate: 0, low: 0, none: 0 },
          west: p.lon,
          east: p.lon,
          south: p.lat,
          north: p.lat,
          point: p,
        };
        cells.set(key, c);
      }
      c.count++;
      c.sx += x;
      c.sy += y;
      c.levels[p.w]++;
      c.west = Math.min(c.west, p.lon);
      c.east = Math.max(c.east, p.lon);
      c.south = Math.min(c.south, p.lat);
      c.north = Math.max(c.north, p.lat);
    }
    if (!merge) return items;
    for (const c of cells.values()) {
      c.x = c.sx / c.count;
      c.y = c.sy / c.count;
      c.r = c.count === 1 ? 13 : clusterSize(c.count) / 2;
      items.push(c);
    }
    items.sort((a, b) => b.count - a.count);
    let placed = items;
    for (let pass = 0; pass < 6; pass++) {
      const next = [];
      let changed = false;
      for (const item of placed) {
        const hit = next.find(
          (p) => Math.hypot(p.x - item.x, p.y - item.y) < p.r + item.r + 2,
        );
        if (!hit) {
          next.push(item);
          continue;
        }
        changed = true;
        hit.count += item.count;
        LEVELS.forEach((k) => (hit.levels[k] += item.levels[k]));
        hit.west = Math.min(hit.west, item.west);
        hit.east = Math.max(hit.east, item.east);
        hit.south = Math.min(hit.south, item.south);
        hit.north = Math.max(hit.north, item.north);
        hit.r = clusterSize(hit.count) / 2;
      }
      placed = next;
      if (!changed) break;
    }
    return placed;
  };

  const render = () => {
    const items = layout();
    if (!items) return;
    const seen = new Set();
    for (const item of items) {
      const single = item.count === 1;
      const key = single
        ? `p${item.point.id}`
        : `c${Math.round(item.x)},${Math.round(item.y)},${item.count}`;
      seen.add(key);
      if (markers.has(key)) continue;
      const marker = single
        ? makePin(item.point)
        : makeCluster(item, map.unproject([item.x, item.y]));
      markers.set(key, marker.addTo(map));
    }
    for (const [key, marker] of markers) {
      if (!seen.has(key)) {
        marker.remove();
        markers.delete(key);
      }
    }
  };

  map.on("moveend", render);
  map.on("resize", render);

  return {
    setData(next) {
      points = next;
      for (const marker of markers.values()) marker.remove();
      markers.clear();
      render();
    },

    select(id) {
      const prev = markers.get(`p${selected}`);
      selected = id || "";
      if (prev) {
        const el = prev.getElement();
        el.innerHTML = pinSVG(el.dataset.level, false);
      }
      const next = markers.get(`p${selected}`);
      if (next) {
        const el = next.getElement();
        el.innerHTML = pinSVG(el.dataset.level, true);
        el.parentElement?.appendChild(el);
      }
    },
  };
}
