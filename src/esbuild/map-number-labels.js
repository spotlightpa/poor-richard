window.SPLMapCustomCode = function (map, config) {
  const idProperty = config.property;
  if (!idProperty) return;

  function ringArea(ring) {
    let a = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      a += ring[i][0] * ring[j][1] - ring[j][0] * ring[i][1];
    }
    return a / 2;
  }
  function segmentDistSq(px, py, a, b) {
    let x = a[0],
      y = a[1],
      dx = b[0] - x,
      dy = b[1] - y;
    if (dx || dy) {
      const t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = b[0];
        y = b[1];
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }
    dx = px - x;
    dy = py - y;
    return dx * dx + dy * dy;
  }
  function signedDistance(x, y, rings) {
    let inside = false;
    let minSq = Infinity;
    for (const ring of rings) {
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const a = ring[i],
          b = ring[j];
        if (
          a[1] > y !== b[1] > y &&
          x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]
        ) {
          inside = !inside;
        }
        minSq = Math.min(minSq, segmentDistSq(x, y, a, b));
      }
    }
    return (inside ? 1 : -1) * Math.sqrt(minSq);
  }
  function labelPoint(polygon) {
    const k = Math.cos((polygon[0][0][1] * Math.PI) / 180);
    const rings = polygon.map((ring) =>
      ring.map(([lng, lat]) => [lng * k, lat]),
    );
    const xs = rings[0].map((p) => p[0]);
    const ys = rings[0].map((p) => p[1]);
    const minX = Math.min(...xs),
      minY = Math.min(...ys);
    const width = Math.max(...xs) - minX,
      height = Math.max(...ys) - minY;
    const size = Math.min(width, height);
    if (!size) return null;
    const cell = (x, y, h) => {
      const d = signedDistance(x, y, rings);
      return { x, y, h, d, max: d + h * Math.SQRT2 };
    };
    const queue = [];
    for (let x = minX; x < minX + width; x += size) {
      for (let y = minY; y < minY + height; y += size) {
        queue.push(cell(x + size / 2, y + size / 2, size / 2));
      }
    }
    let best = cell(minX + width / 2, minY + height / 2, 0);
    const precision = Math.max(width, height) / 1000;
    while (queue.length) {
      queue.sort((a, b) => a.max - b.max);
      const c = queue.pop();
      if (c.d > best.d) best = c;
      if (c.max - best.d <= precision) continue;
      const h = c.h / 2;
      queue.push(
        cell(c.x - h, c.y - h, h),
        cell(c.x + h, c.y - h, h),
        cell(c.x - h, c.y + h, h),
        cell(c.x + h, c.y + h, h),
      );
    }
    return [best.x / k, best.y];
  }
  function featureLabel(feature) {
    const g = feature.geometry;
    if (!g) return null;
    if (g.type === "Polygon") return labelPoint(g.coordinates);
    if (g.type === "MultiPolygon") {
      let bestArea = -Infinity,
        best = null;
      for (const poly of g.coordinates) {
        const a = Math.abs(ringArea(poly[0]));
        if (a > bestArea) {
          bestArea = a;
          best = poly;
        }
      }
      return best ? labelPoint(best) : null;
    }
    return null;
  }

  const labelFeatures = config.data.features
    .map((f) => {
      const c = featureLabel(f);
      if (!c) return null;
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: c },
        properties: f.properties || {},
      };
    })
    .filter(Boolean);

  map.addSource("number-labels", {
    type: "geojson",
    data: { type: "FeatureCollection", features: labelFeatures },
  });

  map.addLayer({
    id: "number-labels-bubble",
    type: "circle",
    source: "number-labels",
    filter: ["!=", ["get", idProperty], null],
    paint: {
      "circle-color": "#ffffff",
      "circle-stroke-color": config.mapColor,
      "circle-stroke-width": 1.5,
      "circle-radius": 13,
    },
  });

  map.addLayer({
    id: "number-labels-text",
    type: "symbol",
    source: "number-labels",
    filter: ["!=", ["get", idProperty], null],
    layout: {
      "text-field": ["to-string", ["get", idProperty]],
      "text-font": ["Noto Sans Regular"],
      "text-size": 13,
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      "text-color": config.mapColor,
    },
  });
};
