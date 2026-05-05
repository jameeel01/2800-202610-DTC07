import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import L from "leaflet";
import BlueMarker from "../assets/BlueMarker.svg";

const bluemarker = L.icon({
  iconUrl: BlueMarker,
  iconSize: [38, 48],
  iconAnchor: [19, 48],
  popupAnchor: [0, -38],
});

function ClickHandler({ isPinDropMode }) {
  const [position, setPosition] = useState(null); // Location Container
  useMapEvents({
    click(e) {
      if (!isPinDropMode) return;
      setPosition(e.latlng);
    },
  });

  if (position === null) {
    return null;
  } else
    return (
      <Marker position={position} icon={bluemarker}>
        <Popup>
          Latitude: {position.lat} <br></br>
          Longitude: {position.lng} <br></br>
          Temperature Drop: {"-2.4°C"} <br></br>
          Number Of Plantable Trees: {"3 Trees"} <br></br>
          Area Of Shade Coverage: {"160 m²"}
        </Popup>
      </Marker>
    );
}

function LeafletMap({ isPinDropMode, setIsPinDropMode }) {
  return (
    <div style={{ height: "calc(100vh - 80px)" }}>
      {isPinDropMode && ( // Popup Banner
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            background: "#111827",
            padding: "10px 20px",
            borderRadius: "8px",
            display: "flex",
            gap: "16px",
            alignItems: "center",
            fontWeight: "bold",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          <span style={{ color: "#9ca3af" }}>
            Tap the map to place your pin. To confirm, click on the marker.
          </span>

          <button
            onClick={() => setIsPinDropMode(false)}
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

      <MapContainer // Map Centered On Van
        center={[49.24966, -123.11934]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <ClickHandler // Handles Click State
          isPinDropMode={isPinDropMode}
          setIsPinDropMode={setIsPinDropMode}
        />

        <TileLayer // Actual Map
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>

      <button // Nomination Button
        onClick={() => setIsPinDropMode(true)}
        style={{
          position: "relative",
          bottom: "70px",
          right: "-1570px",
          zIndex: 1000,
          padding: "10px 18px",
          background: "#1a1a2e",
          color: "#9ca3af",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Nominate +
      </button>
    </div>
  );
}

export default LeafletMap;
