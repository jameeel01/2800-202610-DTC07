import { useMap } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import { fetchShadeData } from "../utils/shadeCalc";
import L from "leaflet";
import "leaflet.heat";

function HeatmapLayer({ isPanelOpen }) {
  const map = useMap();
  const [showHeatMap, setShowHeatMap] = useState(true);
  const heatLayerRef = useRef(null);
  const pointsRef = useRef([]);

  useEffect(() => {
    let heat;

    fetchShadeData().then((data) => {
      const points = data.sampleTrees
        .filter((tree) => tree.latitude && tree.longitude)
        .map((tree) => [tree.latitude, tree.longitude, 0.5]);

      pointsRef.current = points;

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

  const handleToggle = () => {
    if (!heatLayerRef.current) return;
    if (showHeatMap) {
      // clear all points — renders an empty canvas (fully hidden)
      heatLayerRef.current.setLatLngs([]);
    } else {
      // restore the original points
      heatLayerRef.current.setLatLngs(pointsRef.current);
    }
    setShowHeatMap((prev) => !prev);
  };

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
        onClick={handleToggle}
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
