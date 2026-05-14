import { useEffect, useState, useRef } from "react";
import { useMap } from "react-leaflet";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function NominationsPanel() {
  const map = useMap();
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const startY = useRef(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/nominations`)
      .then((res) => res.json())
      .then((data) => {
        setNominations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleNominationClick = (nomination) => {
    const lat = nomination.location?.latitude;
    const lng = nomination.location?.longitude;
    if (lat && lng) {
      map.flyTo([lat, lng], 16, { animate: true, duration: 0.8 });
      setIsOpen(false);
    }
  };

  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const diff = startY.current - e.changedTouches[0].clientY;
    if (diff > 50) setIsOpen(true);
    if (diff < -50) setIsOpen(false);
  };

  const handleMouseDown = (e) => { startY.current = e.clientY; };
  const handleMouseUp = (e) => {
    const diff = startY.current - e.clientY;
    if (diff > 30) setIsOpen(true);
    if (diff < -30) setIsOpen(false);
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "55%",
        background: "#f5f0eb",
        borderRadius: "16px 16px 0 0",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.12)",
        transform: isOpen ? "translateY(0)" : "translateY(calc(100% - 48px))",
        transition: "transform 0.3s ease",
      }}
    >
      {/* drag handle */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          padding: "10px 0 8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <div style={{ width: "36px", height: "4px", background: "#ccc", borderRadius: "2px" }} />
        <span style={{ fontSize: "13px", fontWeight: "600", color: "#344e41" }}>
          Nominations near you
        </span>
      </div>

      {/* list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
        {loading && (
          <p style={{ fontSize: "13px", color: "#888", textAlign: "center", marginTop: "16px" }}>
            Loading...
          </p>
        )}
        {!loading && nominations.length === 0 && (
          <p style={{ fontSize: "13px", color: "#888", textAlign: "center", marginTop: "16px" }}>
            No nominations yet. Be the first.
          </p>
        )}
        {nominations.map((n) => (
          <div
            key={n._id}
            onClick={() => handleNominationClick(n)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 12px",
              background: "white",
              borderBottom: "1px solid #e8e8e8",
              cursor: "pointer",
            }}
          >
            <span style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#1a3a0f",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              marginRight: "12px",
            }}>
              {n.title}
            </span>
            <span style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#344e41",
              whiteSpace: "nowrap",
            }}>
              {n.upvoteCount} upvotes
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NominationsPanel;
