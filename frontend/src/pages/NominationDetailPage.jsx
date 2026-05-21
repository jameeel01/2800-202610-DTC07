import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  calculateTreeCount,
  calculateTempReduction,
  calculateShadeArea,
} from "../utils/shadeCalc";

const blackmarker = L.icon({
  iconUrl: "/ShadedPin.png",
  iconSize: [32, 42],
  iconAnchor: [16, 42],
});

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// calculate how long ago the nomination was submitted
function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  return `${Math.floor(diff / 2592000)} months ago`;
}

function NominationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nomination, setNomination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch nomination by ID on page load
  useEffect(() => {
    const fetchNomination = async () => {
      try {
        const res = await fetch(`${API_URL}/api/nominations/${id}`);
        if (!res.ok) {
          setError("Nomination not found.");
          return;
        }
        const data = await res.json();
        setNomination(data);
      } catch (err) {
        console.error("Failed to fetch nomination:", err);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchNomination();
  }, [id]);

  // loading state
  if (loading)
    return <div className="p-6 text-sm text-gray-500">Loading...</div>;

  // error state
  if (error) return <div className="p-6 text-sm text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#f0f7f0]">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* back button */}
        <button
          onClick={() => navigate("/map")}
          className="flex items-center gap-1 text-sm text-[#344e41] font-medium mb-4"
        >
          ← Back
        </button>

        {/* nomination title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {nomination.title}
        </h1>

        {/* category badge and timestamp */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm bg-[#344e41] text-white px-3 py-0.5 rounded-full font-medium">
            {nomination.category || "other"}
          </span>
          <span className="text-sm text-gray-400">
            Nominated {timeAgo(nomination.createdAt)}
          </span>
        </div>

        {/* upvote count badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#f0f7f0] border border-[#344e41] rounded-full px-4 py-1.5 mb-6">
          <span className="text-[#344e41] font-bold text-sm">▲</span>
          <span className="text-[#344e41] font-bold text-sm">
            {nomination.upvoteCount} upvotes
          </span>
        </div>

        {/* full description */}
        {/* small non-interactive map preview */}
        <div className="h-48 w-full rounded-2xl overflow-hidden mb-4">
          <MapContainer
            center={[
              nomination.location.latitude,
              nomination.location.longitude,
            ]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            dragging={false}
            zoomControl={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            keyboard={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker
              position={[
                nomination.location.latitude,
                nomination.location.longitude,
              ]}
              icon={blackmarker}
            />
          </MapContainer>
        </div>

        {/* full description */}
        <div className="bg-white rounded-2xl p-4 mb-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            {nomination.description || "No description provided."}
          </p>
        </div>

        {/* estimated impact summary */}
        <div className="bg-white rounded-2xl p-4 mb-4">
          <p className="text-sm font-bold text-[#344e41] mb-3">
            Estimated Impact
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: "Avg Temp",
                value: `-${calculateTempReduction(calculateTreeCount(nomination.upvoteCount))}°C`,
              },
              {
                label: "Trees",
                value: `${calculateTreeCount(nomination.upvoteCount)}`,
              },
              {
                label: "Shade",
                value: `${calculateShadeArea(calculateTreeCount(nomination.upvoteCount))}m²`,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-[#f0f7f0] rounded-xl p-2 text-center"
              >
                <p className="text-[15px] font-bold text-[#344e41]">{value}</p>
                <p className="text-[11px] text-gray-500">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            Based on Vancouver climate data.
          </p>

          {/* view impact estimate button */}
          <button
            onClick={() => navigate(`/nomination/${id}/impact`)}
            className="mt-3 text-sm text-[#344e41] font-semibold underline"
          >
            See full impact breakdown →
          </button>
        </div>
      </div>
    </div>
  );
}

export default NominationDetailPage;
