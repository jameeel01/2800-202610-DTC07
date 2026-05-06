import { Marker, Popup, useMapEvents } from "react-leaflet";
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

export default ClickHandler;
