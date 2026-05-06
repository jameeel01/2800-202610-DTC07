import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import HeatmapLayer from "./HeatMapLayer";
import ClickHandler from "./ClickHandler";
import PinDropBanner from "./PinDropBanner";
import NominateButton from "./NominateButton";

function LeafletMap({ isPinDropMode, setIsPinDropMode }) {
  return (
    <div style={{ position: "relative", height: "calc(100vh - 80px)" }}>
      <MapContainer // Map Centered On Van
        center={[49.2827, -123.1207]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <ClickHandler // Handles Click State
          isPinDropMode={isPinDropMode}
          setIsPinDropMode={setIsPinDropMode}
        />

        <PinDropBanner // Popup Banner When In Nominate Mode
          isPinDropMode={isPinDropMode}
          setIsPinDropMode={setIsPinDropMode}
        ></PinDropBanner>
        <HeatmapLayer></HeatmapLayer>

        <TileLayer // Actual Map
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
      <NominateButton setIsPinDropMode={setIsPinDropMode}></NominateButton>
    </div>
  );
}

export default LeafletMap;
