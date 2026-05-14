import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const aiMarker = (index) =>
  L.divIcon({
    html: `
    <div style="
      width: 36px;
      height: 36px;
      background: rgba(255, 200, 0, 0.85);
      border: 3px solid #f59e0b;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      color: #1a1a2e;
      box-shadow: 0 0 0 6px rgba(255,200,0,0.25);
      animation: pulse 2s infinite;
    ">${index + 1}</div>
  `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    className: "",
  });

function AISuggester({ suggestions }) {
  if (!suggestions || !Array.isArray(suggestions)) return null;

  return (
    <>
      {suggestions.map((s, i) => {
        if (!s.lat || !s.lng) return null;
        return (
          <Marker key={i} position={[s.lat, s.lng]} icon={aiMarker(i)}>
            <Popup>
              <div style={{ maxWidth: "200px" }}>
                <p
                  style={{
                    fontWeight: "700",
                    color: "#1a3a0f",
                    margin: "0 0 4px",
                  }}
                >
                  AI Shade Recommendation #{i + 1}
                </p>
                <p
                  style={{ fontSize: "13px", color: "#333", margin: "0 0 8px" }}
                >
                  {s.reason}
                </p>
                <p style={{ fontSize: "11px", color: "#888", margin: 0 }}>
                  Based on Vancouver tree density data. This is an AI estimate,
                  not official city data.
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default AISuggester;
