import { useMap } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import { fetchShadeData } from "../utils/shadeCalc";
import L from "leaflet";
import "leaflet.heat";

function HeatmapLayer() {
  const map = useMap();
  const [showHeatMap, setShowHeatMap] = useState(true);
  const heatLayerRef = useRef(null);

  useEffect(() => {
    let heat;

    fetchShadeData().then((data) => {
      const points = data.sampleTrees
        .filter((tree) => tree.latitude && tree.longitude)
        .map((tree) => [tree.latitude, tree.longitude, 0.5]);

      heat = L.heatLayer(points, {
        radius: 15,
        blur: 30,
        max: 1.0,
        minOpacity: 0.5,
      });

      heat.addTo(map);
      heatLayerRef.current = heat;
    });

    return () => {
      if (heat) map.removeLayer(heat);
    };
  }, [map]);

  useEffect(() => {
    if (!heatLayerRef.current) return;
    if (showHeatMap) {
      heatLayerRef.current.addTo(map);
    } else {
      map.removeLayer(heatLayerRef.current);
    }
  }, [showHeatMap, map]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "24px",
        left: "16px",
        zIndex: 1000,
      }}
    >
      <button
        onClick={() => setShowHeatMap((prev) => !prev)} // Flip boolean
        style={{
          padding: "10px 18px",
          background: "#2d6a0f",
          color: "white",
          borderRadius: "8px",
          fontWeight: "bold",
        }}
      >
        {showHeatMap ? "Hide Heatmap" : "Show Heatmap"}
      </button>
    </div>
  );
}

export default HeatmapLayer;
