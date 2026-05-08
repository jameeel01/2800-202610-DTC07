import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import L from "leaflet";
import BlueMarker from "../assets/BlueMarker.svg";
import HeatmapLayer from "./HeatMapLayer";
import StreetTreesLayer from "./StreetTreeLayer";
import LoadingSpinner from "./LoadingSpinner";
import BottomSheet from "./BottomSheet";

const bluemarker = L.icon({
  iconUrl: BlueMarker,
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

function NominationPanel({ pin, onClose, onSubmit, onRemove }) {
  const [locationName, setLocationName] = useState("");
  const [reason, setReason] = useState("");

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
    fontFamily: "sans-serif",
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
        fontFamily: "sans-serif",
        borderLeft: "1px solid #b5d48a",
      }}
    >
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

function LeafletMap({ isPinDropMode, setIsPinDropMode }) {
  const [pins, setPins] = useState([]);
  const [activePin, setActivePin] = useState(null);
  const [notification, setNotification] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePinPlaced = (latlng) => {
    const newPin = {
      id: Date.now(),
      latlng,
      label: `${latlng.lat.toFixed(4)}° N, ${Math.abs(latlng.lng).toFixed(4)}° W`,
    };
    setPins((prev) => [...prev, newPin]);
    setActivePin(newPin);
  };

  const handleSubmit = ({ pin, locationName, reason }) => {
    setPins((prev) =>
      prev.map((p) =>
        p.id === pin.id ? { ...p, locationName, reason, submitted: true } : p,
      ),
    );
    setActivePin(null);
    setIsPinDropMode(false);
    showNotification("Nomination submitted successfully!");
  };

  const handlePanelClose = () => {
    setActivePin(null);
  };

  const handleExitNomination = () => {
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
      className="map-wrapper"
      style={{
        display: "flex",
        position: "relative",
        zIndex: 0,
      }}
    >
      {!mapReady && <LoadingSpinner></LoadingSpinner>}
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
          ✓ {notification}
        </div>
      )}

      {/* Pin drop banner */}
      {isPinDropMode && !activePin && (
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
      )}

      <MapContainer
        center={[49.24966, -123.11934]}
        zoom={13}
        scrollWheelZoom={false}
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
        <StreetTreesLayer></StreetTreesLayer>
        <HeatmapLayer></HeatmapLayer>
      </MapContainer>

      {activePin && (
        // <NominationPanel
        //   pin={activePin}
        //   onClose={handleExitNomination}
        //   onSubmit={handleSubmit}
        //   onRemove={handleRemove}
        // />

        <BottomSheet
          isOpen={!!activePin}
          onClose={handleExitNomination}
          pin={activePin}
        />
      )}

      {!activePin && (
        <button
          onClick={() => setIsPinDropMode(true)}
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
            padding: "10px 18px",
            background: "#2d6a0f",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          Nominate +
        </button>
      )}
    </div>
  );
}

export default LeafletMap;
