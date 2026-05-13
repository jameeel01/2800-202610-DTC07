import { useState, useEffect } from "react";
import LeafletMap from "../components/Map";

function MapPage({ isPinDropMode, setIsPinDropMode }) {
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch nominations from backend on page load
  useEffect(() => {
    const fetchNominations = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/nominations`,
        );
        const data = await res.json();
        if (res.ok) {
          setNominations(data);
        } else {
          setError("Failed to load nominations.");
        }
      } catch (err) {
        console.error("Failed to fetch nominations:", err);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchNominations();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <LeafletMap
      isPinDropMode={isPinDropMode}
      setIsPinDropMode={setIsPinDropMode}
      nominations={nominations}
    />
  );
}

export default MapPage;
