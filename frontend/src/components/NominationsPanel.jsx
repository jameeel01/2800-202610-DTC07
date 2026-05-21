import { useEffect, useState, useRef, useCallback } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function NominationsPanel({ onNominationSelect, onOpenChange }) {
  const map = useMap();
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (onOpenChange) onOpenChange(isOpen);
  }, [isOpen]);
  const panelRef = useRef(null);
  const dragHandleRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Add native listeners BEFORE disableClickPropagation so they run first
  useEffect(() => {
    const panel = panelRef.current;
    const handle = dragHandleRef.current;

    if (!panel || !handle) return;

    const toggle = () => setIsOpen((prev) => !prev);

    // Attach to drag handle natively — runs before Leaflet's stopPropagation
    handle.addEventListener("click", toggle);

    // Now disable click propagation on the whole panel so map doesn't react
    L.DomEvent.disableClickPropagation(panel);
    L.DomEvent.disableScrollPropagation(panel);

    return () => {
      handle.removeEventListener("click", toggle);
    };
  }, []);

  // Close button native listener
  useEffect(() => {
    const btn = closeBtnRef.current;
    if (!btn) return;
    const close = (e) => { e.stopPropagation(); setIsOpen(false); };
    btn.addEventListener("click", close);
    return () => btn.removeEventListener("click", close);
  }, [isOpen]); // re-run when isOpen changes so ref is attached after render

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/nominations`)
      .then((res) => res.json())
      .then((data) => {
        setNominations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleNominationClick = useCallback((nomination) => {
    const lat = nomination.location?.latitude;
    const lng = nomination.location?.longitude;
    if (lat && lng) {
      map.flyTo([lat, lng], 16, { animate: true, duration: 0.8 });
    }
    if (onNominationSelect) onNominationSelect(nomination);
    setIsOpen(false);
  }, [map, onNominationSelect]);

  return (
    <div
      ref={panelRef}
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
      {/* drag handle — native click attached via ref */}
      <div
        ref={dragHandleRef}
        style={{
          padding: "10px 16px 8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          cursor: "pointer",
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        <div style={{ width: "36px", height: "4px", background: "#ccc", borderRadius: "2px" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#344e41" }}>
            {isOpen ? `${nominations.length} nominations near you` : "Nominations near you"}
          </span>

          {isOpen && (
            <button
              ref={closeBtnRef}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                color: "#9ca3af",
                cursor: "pointer",
                lineHeight: 1,
                padding: "0 4px",
              }}
            >
              ×
            </button>
          )}
        </div>
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
              gap: "10px",
            }}
          >
            <svg width="12" height="16" viewBox="0 0 12 16" fill="none" style={{ flexShrink: 0 }}>
              <path d="M6 0C2.686 0 0 2.686 0 6c0 4.5 6 10 6 10s6-5.5 6-10C12 2.686 9.314 0 6 0z" fill="#344e41" />
              <circle cx="6" cy="6" r="2" fill="white" />
            </svg>

            <span style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#1a3a0f",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}>
              {n.title.split(", Vancouver")[0].split(", BC")[0]}
            </span>

            <span style={{ fontSize: "13px", fontWeight: "600", color: "#344e41", whiteSpace: "nowrap" }}>
              {n.upvoteCount} upvotes
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NominationsPanel;
