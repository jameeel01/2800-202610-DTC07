import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const aiMarker = L.divIcon({
  html: "✨",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  className: "",
});

function AISuggester({ suggestions }) {
  return (
    <>
      {suggestions.map((s, i) => (
        <Marker key={i} position={[s.lat, s.lng]} icon={aiMarker}>
          <Popup>
            <strong>AI Suggestion</strong>
            <br />
            {s.reason}
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default AISuggester;
