import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import { OnboardingTour, TourRestartButton } from "./OnboardingTour";
import HeatmapLayer from "./HeatMapLayer";
import LoadingSpinner from "./LoadingSpinner";
import BottomSheet from "./BottomSheet";
import NominationsPanel from "./NominationsPanel";
import NominationPopup from "./NominationPopup";
import BlueMarkerSvg from "../assets/BlueMarker.svg";
import AISuggester from "./AISuggester";
import confetti from "canvas-confetti";
import BCITLogo from "../assets/BCIT_logo.png";

const blackmarker = L.icon({
  iconUrl: "/ShadedPin.png",
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -38],
});

const bluemarker = L.icon({
  iconUrl: "/ShadedPinHighlighted.png",
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -38],
});

// used for the logged in user's own nominations
const ownmarker = L.icon({
  iconUrl: BlueMarkerSvg,
  iconSize: [38, 48],
  iconAnchor: [19, 48],
  popupAnchor: [0, -38],
});

function ClickHandler({ isPinDropMode, onPinPlaced, onPanelClose }) {
  useMapEvents({
    click(e) {
      if (!isPinDropMode) return;
      onPanelClose();
      onPinPlaced(e.latlng);
    },
  });
  return null;
}

// recenter the preview map when pin coordinates change
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 16);
  }, [lat, lng]);
  return null;
}

// fly to nomination coordinates when selected
function FlyToNomination({ nomination }) {
  const map = useMap();
  useEffect(() => {
    if (nomination?.location?.latitude && nomination?.location?.longitude) {
      map.flyTo(
        [nomination.location.latitude, nomination.location.longitude],
        16,
        { duration: 1.2 },
      );
    }
  }, [nomination]);
  return null;
}

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

// BCIT downtown campus coordinates
const BCIT_DOWNTOWN = { lat: 49.2817, lng: -123.1177 };

// calculate distance between two points in meters using haversine
function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// check if coords are near BCIT downtown (within 200m)
function isNearBCIT(lat, lng) {
  return getDistanceMeters(lat, lng, BCIT_DOWNTOWN.lat, BCIT_DOWNTOWN.lng) < 300;
}


function getTreeCountFromNominatim(data) {
  // check type and category from nominatim response
  const type = data?.type?.toLowerCase();
  const category = data?.category?.toLowerCase();
  const amenity = data?.address?.amenity?.toLowerCase();

  return (
    typeToTrees[type] || typeToTrees[category] || typeToTrees[amenity] || 3
  );
}

function NominationPanel({ pin, onClose, onSubmit, onRemove }) {
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

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1.5px solid #b5d48a",
    background: "white",
    fontSize: "14px",
    color: "#555",
    outline: "none",
    marginBottom: "16px",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#1a3a0f",
    marginBottom: "6px",
  };

  return (
    <div
      style={{
        width: "300px",
        background: "#dad7cd",
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid #b5d48a",
        overflowY: "auto",
      }}
    >
      {
        // Small non-interactive map preview centered on nomination coordinates
      }
      <div style={{ height: "140px", width: "100%", overflow: "hidden" }}>
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
          <Marker
            position={[pin.latlng.lat, pin.latlng.lng]}
            icon={bluemarker}
          />
          {/* recenter map when pin changes */}
          <RecenterMap lat={pin.latlng.lat} lng={pin.latlng.lng} />
        </MapContainer>
      </div>

      {
        // Title of the pin (currently coordinates)
      }
      <div style={{ padding: "20px 20px 0" }}>
        <h2
          style={{
            margin: "0 0 4px",
            fontSize: "16px",
            fontWeight: "700",
            color: "#1a3a0f",
            textDecoration: "underline",
            wordBreak: "break-word",
          }}
        >
          {pin.label}
        </h2>

        {
          // Location pinned text and svg
        }
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "20px",
          }}
        >
          <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
            <path
              d="M6 0C2.686 0 0 2.686 0 6c0 4.5 6 10 6 10s6-5.5 6-10C12 2.686 9.314 0 6 0z"
              fill="#17C0E3"
            />
            <circle cx="6" cy="6" r="2" fill="white" />
          </svg>
          <span
            style={{ fontSize: "13px", color: "#3a7d1e", fontWeight: "500" }}
          >
            Location pinned
          </span>
        </div>

        {
          // Text box to enter location name ( can prob set it up to to autocomplete streetname based on coordinates)
        }
        <label style={labelStyle}>Location Name</label>
        <input
          type="text"
          placeholder="e.g. Riley Park Corner"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          style={inputStyle}
        />

        {
          // Text box to enter description and reasoning for shade
        }
        <label style={labelStyle}>Why does this area need shade?</label>
        <textarea
          placeholder="Describe the need for shade..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ ...inputStyle, height: "90px", resize: "none" }}
        />

        {
          // Projected impact section
        }
        <div className="bg-[#c8d8b0] rounded-xl p-3 mb-4">
          <p className="text-[11px] font-bold text-[#1a3a0f] uppercase tracking-wide mb-2">
            🌳 Estimated Impact — {treeCount} Trees
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Avg Temp Reduction", value: `-${tempReduction}°C` },
              { label: "Trees Planted", value: `${treeCount}` },
              { label: "Shade Coverage", value: `${shadeArea}m²` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-lg p-2 text-center">
                <p className="text-[15px] font-bold text-[#344e41] m-0">
                  {value}
                </p>
                <p className="text-[11px] text-[#588157] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[#588157] mt-2">
            Based on Vancouver climate data.
          </p>
        </div>
      </div>

      {
        // Submit Button
      }
      <div
        style={{
          padding: "0 20px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <button
          onClick={() => onSubmit({ pin, locationName, reason })}
          style={{
            width: "100%",
            padding: "13px",
            background: "#344e41",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Submit Nomination
        </button>

        {
          // Cancel Button
        }
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px",
            background: "#3a5a40",
            color: "white",
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>

        {
          // Remove Pin Button
        }
        <button
          onClick={() => onRemove(pin.id)}
          style={{
            width: "100%",
            padding: "12px",
            background: "white",
            color: "#8b1a1a",
            border: "2px solid #e8a0a0",
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Remove Pin
        </button>
      </div>
    </div>
  );
}

function LeafletMap({
  isPinDropMode,
  setIsPinDropMode,
  nominations = [],
  onNewNomination,
  preSelectedId,
}) {
  const [pins, setPins] = useState([]);
  const [activePin, setActivePin] = useState(null);
  const [notification, setNotification] = useState(null);
  const [notificationIsLogin, setNotificationIsLogin] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showNominations, setShowNominations] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [selectedNominationId, setSelectedNominationId] = useState(null);
  const [selectedNomination, setSelectedNomination] = useState(null);
  const [localNominations, setLocalNominations] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // button bottom position floats above the nominations panel
  const btnBottom = isPanelOpen ? "calc(55% + 16px)" : "68px";
  const [suggestions, setSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const tourRestartRef = useRef(null);
  const navigate = useNavigate();

  // cleanup confetti canvas on unmount or navigation
  useEffect(() => {
    return () => {
      // remove any leftover confetti canvases when component unmounts
      const canvases = document.querySelectorAll("canvas");
      canvases.forEach((c) => {
        if (c.style.position === "fixed") {
          document.body.removeChild(c);
        }
      });
    };
  }, []);

  // get logged in user for marker differentiation and feature gating
  const user = JSON.parse(localStorage.getItem("user"));

  // filter nominations based on toggle
  const visibleNominations = showOnlyMine
    ? nominations.filter(
      (n) => user && String(n.nominatorId) === String(user.id),
    )
    : nominations;

  // auto-select nomination when navigated from nominations page
  useEffect(() => {
    if (preSelectedId && nominations.length > 0) {
      const found = nominations.find((n) => n._id === preSelectedId);
      if (found) {
        setSelectedNominationId(preSelectedId);
        setSelectedNomination(found);
      }
    }
  }, [preSelectedId, nominations]);

  const triggerEasterEgg = () => {
    setShowEasterEgg(true);

    // create a temporary canvas for confetti that cleans itself up
    const myCanvas = document.createElement("canvas");
    myCanvas.style.position = "fixed";
    myCanvas.style.top = "0";
    myCanvas.style.left = "0";
    myCanvas.style.width = "100%";
    myCanvas.style.height = "100%";
    myCanvas.style.pointerEvents = "none";
    myCanvas.style.zIndex = "9998";
    document.body.appendChild(myCanvas);

    const myConfetti = confetti.create(myCanvas, { resize: true });

    // confetti burst from center
    myConfetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#2d6a0f", "#4fc3f7", "#a3e635", "#fbbf24", "#f87171"],
    });

    // second burst from sides
    setTimeout(() => {
      myConfetti({
        particleCount: 80,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.5 },
        colors: ["#2d6a0f", "#4fc3f7", "#a3e635"],
      });
      myConfetti({
        particleCount: 80,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.5 },
        colors: ["#2d6a0f", "#4fc3f7", "#a3e635"],
      });
    }, 300);

    // remove the canvas after animation finishes
    setTimeout(() => {
      myConfetti.reset();
      document.body.removeChild(myCanvas);
      setShowEasterEgg(false);
    }, 6000);
  };

  //AI suggestions
  const handleAISuggest = async () => {
    setAiLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5001"}/api/ai/suggest`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ treeData: [], nominations: [] }),
        },
      );
      const data = await res.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(
          data.suggestions.map((s, i) => ({ ...s, originalIndex: i })),
        );
      } else {
        showNotification(data.error || "Failed to get suggestions.");
      }
    } catch (err) {
      console.error("AI suggest failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  // adds AI suggestion as a pin
  const handleNominateSuggestion = ({ lat, lng }) => {
    setIsPinDropMode(false);
    handlePinPlaced({ lat, lng });
  };

  // Removes AI suggestion
  const handleRemoveSuggestion = (index) => {
    setSuggestions((prev) => prev.filter((_, i) => i !== index));
  };

  const showNotification = (message, isLogin = false) => {
    setNotification(message);
    setNotificationIsLogin(isLogin);
    setTimeout(() => {
      setNotification(null);
      setNotificationIsLogin(false);
    }, 3000);
  };

  const handlePinPlaced = (latlng) => {
    const newPin = {
      id: Date.now(),
      latlng,
      label: `${latlng.lat.toFixed(4)}° N, ${Math.abs(latlng.lng).toFixed(4)}° W`,
    };
    // remove any pins that were not submitted before adding the new one
    setPins((prev) => [...prev.filter((p) => p.submitted), newPin]);
    setActivePin(newPin);

    // easter egg — check if pin is near BCIT downtown

  };

  const handleSubmit = async ({ pin, locationName, reason }) => {
    try {
      // get logged in user from localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!user || !token) {
        showNotification("Sign in to nominate a location", true);
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/nominations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            latitude: pin.latlng.lat,
            longitude: pin.latlng.lng,
            streetAddress: locationName,
            nominatorId: user.id,
            nominatorName: user.name,
            nominatorEmail: user.email,
            title: locationName,
            description: reason,
            category: "other", // default for now
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        showNotification(data.error || "Submission failed.");
        return;
      }

      // update local pin state on success
      setPins((prev) => prev.filter((p) => p.id !== pin.id));
      if (data.nomination) {
        setLocalNominations((prev) => [...prev, data.nomination]);
      }
      setActivePin(null);
      setIsPinDropMode(false);
      showNotification("Nomination submitted successfully!");

      // easter egg — trigger if nomination is near BCIT downtown
      if (isNearBCIT(pin.latlng.lat, pin.latlng.lng)) {
        triggerEasterEgg();
      }

      // add new nomination to map instantly without page refresh
      if (onNewNomination) {
        onNewNomination({
          _id: data._id,
          location: {
            latitude: pin.latlng.lat,
            longitude: pin.latlng.lng,
          },
          title: locationName,
          description: reason,
          upvoteCount: 0,
          category: "other",
        });
      }
    } catch (err) {
      console.error("Submit error:", err);
      showNotification("Something went wrong. Try again.");
    }
  };

  const handlePanelClose = () => {
    setActivePin(null);
  };

  const handleExitNomination = () => {
    if (activePin) {
      setPins((prev) => prev.filter((p) => p.id !== activePin.id));
    }
    setActivePin(null);
    setIsPinDropMode(false);
  };

  const handleRemove = (pinId) => {
    setPins((prev) => prev.filter((p) => p.id !== pinId));
    setActivePin(null);
    showNotification("Pin removed.");
  };

  return (
    <div
      className={"map-wrapper"}
      style={{
        display: "flex",
        position: "relative",
        zIndex: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {!mapReady && <LoadingSpinner></LoadingSpinner>}

      {/* Onboarding tour, shows automatically on first visit */}
      <OnboardingTour onRestartRef={tourRestartRef} />


      {/* nomination popup */}
      {selectedNomination && (
        <NominationPopup
          nomination={selectedNomination}
          onClose={() => {
            setSelectedNomination(null);
            setSelectedNominationId(null);
          }}
        />
      )}

      {/* notification banner */}
      {notification && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1001,
            background: "#2d6a0f",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            whiteSpace: "nowrap",
          }}
        >
          {notificationIsLogin ? (
            <>
              🔒 {notification} —{" "}
              <span
                onClick={() => navigate("/login")}
                style={{
                  textDecoration: "underline",
                  cursor: "pointer",
                  color: "#a3e635",
                }}
              >
                Log in
              </span>
            </>
          ) : (
            <>✓ {notification}</>
          )}
        </div>
      )}

      {/* BCIT easter egg banner — fixed so it always shows on top */}
      {showEasterEgg && (
        <div
          style={{
            position: "fixed",
            top: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: "#003D6B",
            color: "white",
            padding: "20px 28px",
            borderRadius: "12px",
            fontWeight: "700",
            fontSize: "15px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            border: "3px solid #003D6B",
            textAlign: "center",
            pointerEvents: "none",
            minWidth: "220px",
          }}
        >
          <img
            src={BCITLogo}
            alt="BCIT"
            style={{ width: "72px", borderRadius: "6px" }}
          />
          <span style={{ fontSize: "16px", fontWeight: "800", letterSpacing: "0.5px" }}>
            You found the BCIT Downtown Campus!
          </span>
          <span style={{ fontSize: "12px", color: "#a8d4f5", fontWeight: "500" }}>
            555 Seymour St needs some shade too
          </span>
        </div>
      )
      }

      {/* AI loading banner */}
      {
        aiLoading && (
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1001,
              background: "#1a1a2e",
              color: "#4fc3f7",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              whiteSpace: "nowrap",
            }}
          >
            <img
              src="/src/assets/ai.png"
              width="24"
              height="24"
              style={{
                marginRight: "6px",
                filter:
                  "brightness(0) saturate(100%) invert(72%) sepia(98%) saturate(400%) hue-rotate(167deg) brightness(101%)",
              }}
            />
            Finding the best spots for shade...
          </div>
        )
      }

      {/* Pin drop banner */}
      {
        isPinDropMode && !activePin && (
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              background: "#2d6a0f",
              padding: "10px 20px",
              borderRadius: "8px",
              display: "flex",
              gap: "16px",
              alignItems: "center",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: "white" }}>Tap the map to place your pin.</span>
            <button
              onClick={handleExitNomination}
              style={{
                background: "none",
                color: "#9ca3af",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        )
      }

      <MapContainer
        center={[49.24966, -123.11934]}
        zoom={13}
        minZoom={11}
        maxBounds={[[48.9, -123.6], [49.6, -122.4]]}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        style={{ flex: 1, height: "100%" }}
        whenReady={() => setMapReady(true)}
      >
        <ClickHandler
          isPinDropMode={isPinDropMode}
          onPinPlaced={handlePinPlaced}
          onPanelClose={handlePanelClose}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* existing nominations from backend + locally submitted ones */}
        {[...visibleNominations, ...localNominations].map((n) => {
          const lat = n.location?.latitude;
          const lng = n.location?.longitude;
          if (!lat || !lng) return null;
          const isSelected = selectedNominationId === n._id;
          // use blue marker for user's own nominations, highlighted for selected, black for others
          const isOwn = user && String(n.nominatorId) === String(user.id);
          const icon = isSelected
            ? bluemarker
            : isOwn
              ? ownmarker
              : blackmarker;
          return (
            <Marker
              key={n._id}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  setSelectedNominationId(n._id);
                  setSelectedNomination(n);
                },
              }}
            />
          );
        })}

        {/* pins placed in current session */}
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={pin.latlng}
            icon={bluemarker}
            eventHandlers={{
              click: () => setActivePin(pin),
            }}
          />
        ))}

        <NominationsPanel
          isOpen={showNominations}
          onClose={() => setShowNominations(false)}
          onOpenChange={setIsPanelOpen}
          onNominationSelect={(nomination) => {
            setSelectedNomination(nomination);
            setSelectedNominationId(nomination._id);
          }}
        />
        {/* fly to nomination when selected */}
        <FlyToNomination nomination={selectedNomination} />
        <HeatmapLayer></HeatmapLayer>
        <AISuggester
          suggestions={suggestions}
          onRemove={handleRemoveSuggestion}
          onNominate={handleNominateSuggestion}
        />
      </MapContainer>

      {/* AI button — only show if logged in */}
      {
        user && (
          <button
            onClick={handleAISuggest}
            style={{
              position: "absolute",
              bottom: btnBottom,
              right: "16px",
              zIndex: 1000,
              padding: "10px 18px",
              background: "#1a1a2e",
              color: "#4fc3f7",
              border: "2px solid #4fc3f7",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {aiLoading ? (
              "Finding spots..."
            ) : (
              <>
                <img
                  src="/src/assets/ai.png"
                  width="32"
                  height="32"
                  style={{
                    marginRight: "6px",
                    filter:
                      "brightness(0) saturate(100%) invert(72%) sepia(98%) saturate(400%) hue-rotate(167deg) brightness(101%)",
                  }}
                />
                Suggest a Spot
              </>
            )}
          </button>
        )
      }

      {/* toggle between all nominations and user's own — only show if logged in */}
      {
        user && (
          <button
            onClick={() => setShowOnlyMine((prev) => !prev)}
            style={{
              position: "absolute",
              bottom: btnBottom,
              left: "16px",
              zIndex: 1000,
              padding: "10px 18px",
              background: "#2d6a0f",
              color: "white",
              border: "none",
              borderRadius: "2px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            {showOnlyMine ? "Show All" : "Show Mine"}
          </button>
        )
      }

      {/* desktop nomination */}
      {
        activePin && (
          <div className="hidden md:flex">
            <NominationPanel
              pin={activePin}
              onClose={handleExitNomination}
              onSubmit={handleSubmit}
              onRemove={handleRemove}
            />
          </div>
        )
      }

      {/* mobile nomination */}
      <BottomSheet
        isOpen={!!activePin}
        onClose={handleExitNomination}
        onSubmit={handleSubmit}
        onRemove={handleRemove}
        pin={activePin}
      />

      {/* AI Suggested Spot Count Card */}
      {
        suggestions.length > 0 && !activePin && (
          <div
            style={{
              position: "absolute",
              top: "192px",
              right: "16px",
              zIndex: 1000,
              background: "#1a1a2e",
              color: "white",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
              border: "2px solid #f59e0b",
            }}
          >
            {suggestions.length} AI Suggested Spot(s)
          </div>
        )
      }

      {
        suggestions.length > 0 && !activePin && (
          <button
            onClick={() => setSuggestions([])}
            style={{
              position: "absolute",
              top: "248px",
              right: "16px",
              zIndex: 1000,
              padding: "10px 18px",
              background: "#1a1a2e",
              color: "#ef4444",
              border: "2px solid #ef4444",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            ✕ Clear AI Suggestions
          </button>
        )
      }

      {/* nominate button — always visible, prompts login if not signed in */}
      {
        !activePin && (
          <button
            onClick={() => {
              const token = localStorage.getItem("token");
              if (!token) {
                showNotification("Sign in to nominate a location", true);
              } else {
                setIsPinDropMode(true);
              }
            }}
            style={{
              position: "absolute",
              bottom: `calc(${btnBottom} + 56px)`,
              right: "16px",
              zIndex: 1000,
              padding: "10px 18px",
              background: "#2d6a0f",
              color: "white",
              border: "none",
              borderRadius: "2px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Nominate +
          </button>
        )
      }
    </div >
  );
}

export default LeafletMap;