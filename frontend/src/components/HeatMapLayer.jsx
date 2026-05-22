import { useMap } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import { fetchShadeData } from "../utils/shadeCalc";
import L from "leaflet";
import "leaflet.heat";

function HeatmapLayer({ isPanelOpen }) {
  const map = useMap();
  const [showHeatMap, setShowHeatMap] = useState(true);
  const [points, setPoints] = useState([]);
  const heatLayerRef = useRef(null);

  // Fetch tree data once on mount. Guard against the StrictMode
  // double-invoke so a late-resolving fetch from a discarded mount
  // can't push points into the live component after unmount.
  useEffect(() => {
    let cancelled = false;
    fetchShadeData().then((data) => {
      if (cancelled) return;
      const pts = data.sampleTrees
        .filter((t) => t.latitude && t.longitude)
        .map((t) => [t.latitude, t.longitude, 1.0]);
      setPoints(pts);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Create the heat layer exactly ONCE, tied only to `map`.
  //
  // The original bug: the creation effect depended on `points`, so
  // every time `setPoints` ran (and under React 18 StrictMode the
  // effect also runs twice on mount), a fresh L.heatLayer was built
  // and addTo()'d. heatLayerRef was overwritten to the newest one,
  // but the previous instance's canvas was already painted into
  // overlayPane. The toggle effect only knew about the latest ref,
  // so map.removeLayer / setLatLngs / canvas.style.display only
  // affected one of the stacked canvases - leaving the others fully
  // visible (looks like "didn't hide") or partially visible if the
  // cleanup managed to remove some (looks like "dims slightly").
  //
  // Fix: build the layer once, update its data via setLatLngs, and
  // let a single effect own add/remove based on showHeatMap.
  useEffect(() => {
    if (!map || heatLayerRef.current) return;

    heatLayerRef.current = L.heatLayer([], {
      radius: 15,
      blur: 30,
      max: 1.0,
      minOpacity: 0.4,
    });

    return () => {
      const layer = heatLayerRef.current;
      if (!layer) return;
      if (map.hasLayer(layer)) map.removeLayer(layer);
      // Defensive: leaflet.heat's onRemove detaches its canvas from
      // overlayPane, but if anything ever leaves a stale canvas
      // attached, drop it here so unmount can never leak one.
      const canvas = layer._canvas;
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      heatLayerRef.current = null;
    };
  }, [map]);

  // Push new data into the existing layer instead of re-creating it.
  useEffect(() => {
    const layer = heatLayerRef.current;
    if (!layer) return;
    layer.setLatLngs(points);
  }, [points]);

  // Single source of truth for whether the layer is on the map.
  useEffect(() => {
    const layer = heatLayerRef.current;
    if (!layer || !map) return;

    if (showHeatMap) {
      if (!map.hasLayer(layer)) {
        layer.addTo(map);
        layer.redraw();
      }
    } else {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    }
  }, [showHeatMap, map, points]);

  const btnBottom = isPanelOpen ? "calc(55% + 72px)" : "124px";

  return (
    <div
      style={{
        position: "absolute",
        bottom: btnBottom,
        left: "16px",
        zIndex: 1000,
        transition: "bottom 0.3s ease",
      }}
    >
      <button
        onClick={() => setShowHeatMap((prev) => !prev)}
        style={{
          padding: "10px 18px",
          minWidth: "130px",
          background: showHeatMap ? "#2d6a0f" : "#344e41",
          color: "white",
          border: showHeatMap ? "none" : "1px solid #a3b18a",
          borderRadius: "2px",
          fontWeight: "bold",
          fontSize: "13px",
          cursor: "pointer",
        }}
      >
        {showHeatMap ? "Hide Heatmap" : "Show Heatmap"}
      </button>
    </div>
  );
}

export default HeatmapLayer;
