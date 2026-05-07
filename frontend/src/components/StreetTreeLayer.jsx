import { Marker } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import { fetchShadeData } from "../utils/shadeCalc";

const treeMarker = L.divIcon({
  html: "🌳",
  iconSize: [25, 25],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
  className: "", //Removes leaflet styling
});

function StreetTreesLayer() {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchShadeData()
      .then((data) => {
        console.log(data);
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

  return trees.map((tree, index) => {
    const lat = tree.latitude;
    const lng = tree.longitude;

    if (!lat || !lng || lat === 0 || lng === 0) return null;

    return (
      <Marker key={index} position={[lat, lng]} icon={treeMarker}></Marker>
    );
  });
}

export default StreetTreesLayer;
