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
  function ringCentroid(ring) {
    const a = ringArea(ring);
    if (!a) return null;
    let cx = 0,
      cy = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const cross = ring[i][0] * ring[j][1] - ring[j][0] * ring[i][1];
      cx += (ring[i][0] + ring[j][0]) * cross;
      cy += (ring[i][1] + ring[j][1]) * cross;
    }
    return [cx / (6 * a), cy / (6 * a)];
  }
  function featureCentroid(feature) {
    const g = feature.geometry;
    if (!g) return null;
    if (g.type === "Polygon") return ringCentroid(g.coordinates[0]);
    if (g.type === "MultiPolygon") {
      let bestArea = -Infinity,
        best = null;
      for (const poly of g.coordinates) {
        const a = Math.abs(ringArea(poly[0]));
        if (a > bestArea) {
          bestArea = a;
          best = poly[0];
        }
      }
      return best ? ringCentroid(best) : null;
    }
    return null;
  }

  const labelFeatures = config.data.features
    .map((f) => {
      const c = featureCentroid(f);
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
