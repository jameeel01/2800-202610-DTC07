import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const aiMarker = (index) =>
  L.divIcon({
    html: `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
    ">
      <div style="
        width: 36px;
        height: 36px;
        background: rgba(26, 26, 46, 0.95);
        border: 3px solid #4fc3f7;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        color: #4fc3f7;
        box-shadow: 0 0 0 4px rgba(79,195,247,0.25);
        animation: pulse 2s infinite;
      ">${index + 1}</div>
      <div style="
        width: 6px;
        height: 14px;
        background: #4fc3f7;
        border-radius: 0 0 2px 2px;
      "></div>
    </div>
  `,
    iconSize: [36, 50],
    iconAnchor: [18, 50],
    className: "",
  });

function AISuggester({ suggestions, onRemove, onNominate }) {
  return (
    <>
      {suggestions.map((s, i) => {
        if (!s.lat || !s.lng) return null;
        return (
          <Marker
            key={`${s.lat}-${s.lng}`}
            position={[s.lat, s.lng]}
            icon={aiMarker(i)}
          >
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
                <p
                  style={{ fontSize: "11px", color: "#888", margin: "0 0 8px" }}
                >
                  Based on Vancouver tree density data. This is an AI estimate,
                  not official city data.
                </p>
                <button
                  onClick={() => {
                    onNominate({ lat: s.lat, lng: s.lng });
                    onRemove(i);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: "#2d6a0f",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                    marginBottom: "6px",
                  }}
                >
                  + Nominate this spot
                </button>
                <button
                  onClick={() => onRemove(i)}
                  style={{
                    width: "100%",
                    padding: "6px",
                    background: "white",
                    color: "#ef4444",
                    border: "1px solid #ef4444",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  ✕ Remove this suggestion
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default AISuggester;
