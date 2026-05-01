import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";

function ClickHandler() {
  const [position, setPosition] = useState(null); // Location container
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
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

function LeafletMap() {
  return (
    <MapContainer
      center={[49.24966, -123.11934]}
      zoom={13}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler></ClickHandler>
    </MapContainer>
  );
}

export default LeafletMap;
