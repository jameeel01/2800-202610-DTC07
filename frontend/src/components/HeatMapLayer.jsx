import { useMap } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import "leaflet.heat";

function HeatmapLayer() {
  const map = useMap();
  const [showHeatMap, setShowHeatMap] = useState(true);
  const heatLayerRef = useRef(null);

  useEffect(() => {
    const points = [
      [49.2827, -123.1207, 0.9], // goes by [lat,long,intensity]
      [49.2831, -123.1215, 0.8], // 0.0 (cold) - 1.0 (hot)
      [49.282, -123.1198, 0.7],
      [49.2845, -123.123, 0.6],
      [49.281, -123.1185, 0.8],
      [49.2838, -123.1175, 0.7],
      [49.2855, -123.121, 0.9],
      [49.2815, -123.122, 0.6],
    ];

    const heat = window.L.heatLayer(points, {
      radius: 50,
      blur: 30,
      max: 1.0,
      minOpacity: 0.5,
    });

    heat.addTo(map); //Add heatmap to map when it mounts (gets created)
    heatLayerRef.current = heat;

    return () => map.removeLayer(heat); // remove heatmap when it unmounts (gets destroyed)
  }, [map]); //when map is ready, run it

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
          background: "#1a1a2e",
          color: "#9ca3af",
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
