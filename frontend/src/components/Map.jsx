import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";

function ClickHandler({ isPinDropMode, setIsPinDropMode }) {
  const [position, setPosition] = useState(null); // Location container
  useMapEvents({
    click(e) {
      if (!isPinDropMode) return;
      setPosition(e.latlng);
      setIsPinDropMode(false);
    },
  });

  if (position === null) {
    return null;
  } else
    return (
      <Marker position={position}>
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
      <MapContainer
        center={[49.24966, -123.11934]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <ClickHandler
          isPinDropMode={isPinDropMode}
          setIsPinDropMode={setIsPinDropMode}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler />
      </MapContainer>
      <button
        onClick={() => setIsPinDropMode(true)}
        style={{
          position: "absolute",
          bottom: "24px",
          right: "16px",
          zIndex: 1000,
          padding: "10px 18px",
          background: "#1a1a2e",
          color: "white",
          border: "2px solid #4fc3f7",
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
