import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import BlueMarker from "../assets/BlueMarker.svg";

// blue marker icon for the preview map
const bluemarker = L.icon({
  iconUrl: BlueMarker,
  iconSize: [38, 48],
  iconAnchor: [19, 48],
  popupAnchor: [0, -38],
});

// map nominatim location types to estimated tree counts
const typeToTrees = {
  park: 6,
  nature_reserve: 6,
  forest: 6,
  school: 5,
  university: 5,
  college: 5,
  playground: 4,
  recreation_ground: 4,
  pitch: 4,
  plaza: 5,
  square: 5,
  footway: 2,
  pedestrian: 2,
  path: 2,
  bus_stop: 1,
  bus_station: 1,
  street: 2,
  residential: 3,
  commercial: 3,
};

function getTreeCountFromNominatim(data) {
  // check type and category from nominatim response
  const type = data?.type?.toLowerCase();
  const category = data?.category?.toLowerCase();
  const amenity = data?.address?.amenity?.toLowerCase();

  return typeToTrees[type] || typeToTrees[category] || typeToTrees[amenity] || 3;
}

// recenter the preview map when pin coordinates change
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 16);
  }, [lat, lng]);
  return null;
}

function BottomSheet({ isOpen, onClose, pin, onSubmit, onRemove }) {
  const [locationName, setLocationName] = useState("");
  const [reason, setReason] = useState("");

  // tree count derived from nominatim location type
  const [treeCount, setTreeCount] = useState(3);

  // derived impact calculations
  const tempReduction = Math.round(treeCount * 0.3 * 10) / 10;
  const shadeArea = Math.round(treeCount * 150);
  const co2 = Math.round(treeCount * 21);

  // reverse geocode the pin coordinates to auto-fill location name
  useEffect(() => {
    if (!pin) return;

    const fetchAddress = async () => {
      // reset fields when a new pin is placed
      setLocationName("");
      setReason("");
      setTreeCount(3);

      try {
        // call Nominatim API with the pin's coordinates
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${pin.latlng.lat}&lon=${pin.latlng.lng}&format=json`,
          {
            headers: {
              "Accept-Language": "en",
            },
          },
        );
        const data = await res.json();

        // pre-fill the location name field with the returned address
        if (data && data.display_name) {
          setLocationName(data.display_name);
        }

        // calculate tree count based on location type from nominatim
        setTreeCount(getTreeCountFromNominatim(data));
      } catch (err) {
        // log error if geocode fails
        console.error("Reverse geocode failed:", err);
      }
    };

    fetchAddress();
  }, [pin]);

  if (!isOpen || !pin) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-1000 md:hidden">
      <div className="bg-[#f0f7f0] shadow-[0_-4px_20px_rgba(0,0,0,0.15)] pb-6 overflow-hidden">
        {/* small non-interactive map preview centered on nomination coordinates */}
        <div className="h-36 w-full overflow-hidden">
          <MapContainer
            center={[pin.latlng.lat, pin.latlng.lng]}
            zoom={16}
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
            <Marker position={[pin.latlng.lat, pin.latlng.lng]} icon={bluemarker} />
            {/* recenter map when pin changes */}
            <RecenterMap lat={pin.latlng.lat} lng={pin.latlng.lng} />
          </MapContainer>
        </div>

        <div className="px-5 pt-3">
          {/* drag handle bar */}
          <div className="w-10 h-1 bg-gray-400 rounded-full mx-auto mb-4" />

          {/* pin label */}
          <h2 className="text-[16px] font-bold text-[#1a3a0f] underline break-words mb-1">
            {pin.label}
          </h2>

          {/* location pinned indicator */}
          <div className="flex items-center gap-1.5 mb-5">
            <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
              <path
                d="M6 0C2.686 0 0 2.686 0 6c0 4.5 6 10 6 10s6-5.5 6-10C12 2.686 9.314 0 6 0z"
                fill="#17C0E3"
              />
              <circle cx="6" cy="6" r="2" fill="white" />
            </svg>
            <span className="text-[13px] text-[#3a7d1e] font-medium">
              Location pinned
            </span>
          </div>

          {/* location name input */}
          <div className="mb-4">
            <label className="block text-[13px] font-semibold text-[#1a3a0f] mb-1.5">
              Location Name
            </label>
            <input
              type="text"
              placeholder="e.g. Riley Park Corner"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#A3B18A] bg-white text-sm text-[#555] outline-none focus:border-[#344e41]"
            />
          </div>

          {/* reason textarea */}
          <div className="mb-4">
            <label className="block text-[13px] font-semibold text-[#1a3a0f] mb-1.5">
              Why does this area need shade?
            </label>
            <textarea
              placeholder="Describe the need for shade..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#A3B18A] bg-white text-sm text-[#555] outline-none focus:border-[#344e41] h-24 resize-none"
            />
          </div>

          {/* projected impact section */}
          <div className="bg-[#ddeedd] p-3 mb-4" style={{ borderRadius: "2px" }}>
            <p className="text-[11px] font-bold text-[#1a3a0f] uppercase tracking-wide mb-2">
              Estimated Impact — {treeCount} Trees
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Temp Reduction", value: `-${tempReduction}°C` },
                { label: "Trees", value: `${treeCount}` },
                { label: "Shade", value: `${shadeArea}m²` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white p-2 text-center" style={{ borderRadius: "2px" }}>
                  <p className="text-[15px] font-bold text-[#344e41] m-0">{value}</p>
                  <p className="text-[11px] text-[#588157] mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[#588157] mt-2">
              Based on Vancouver climate data.
            </p>
          </div>

          {/* buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => onSubmit({ pin, locationName, reason })}
              className="w-full py-3 bg-[#344e41] text-white text-[15px] font-bold"
              style={{ borderRadius: "2px" }}
            >
              Submit Nomination
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 bg-white border border-[#344e41] text-[#344e41] text-[15px] font-semibold"
              style={{ borderRadius: "2px" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BottomSheet;