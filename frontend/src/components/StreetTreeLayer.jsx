import { Marker } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import { fetchShadeData } from "../utils/shadeCalc";

const treeMarker = L.divIcon({
  html: '<div style="width:10px;height:10px;background:#2d6a0f;border-radius:50%;opacity:0.7;"></div>',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
  popupAnchor: [0, -5],
  className: "",
});

function StreetTreesLayer() {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrees, setShowTrees] = useState(true);

  useEffect(() => {
    fetchShadeData()
      .then((data) => {
        setTrees(data.sampleTrees || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load street trees");
        setLoading(false);
      });
  }, []);

  if (loading) return null;
  if (error) return null;

  return (
    <>
      <div
        style={{
          position: "absolute",
          bottom: "70px",
          left: "16px",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => setShowTrees((prev) => !prev)}
          style={{
            padding: "10px 18px",
            background: "#2d6a0f",
            color: "white",
            borderRadius: "2px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {showTrees ? "Hide Trees" : "Show Trees"}
        </button>
      </div>
      {showTrees &&
        !loading &&
        !error &&
        trees.map((tree, index) => {
          const lat = tree.latitude;
          const lng = tree.longitude;

          if (!lat || !lng || lat === 0 || lng === 0) return null;

          return (
            <Marker
              key={index}
              position={[lat, lng]}
              icon={treeMarker}
            ></Marker>
          );
        })}
    </>
  );
}

export default StreetTreesLayer;
