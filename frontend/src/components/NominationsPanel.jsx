import { useEffect, useState, useRef } from "react";
import {
  calculateTreeCount,
  calculateTempReduction,
  calculateShadeArea,
} from "../utils/shadeCalc";
import ParkIcon from "../assets/park.svg";
import BusStopIcon from "../assets/bus-stop.svg";
import SchoolYardIcon from "../assets/bus-stop.svg";
import PlazaIcon from "../assets/school-yard.svg";
import SidewalkIcon from "../assets/bus-stop.svg";
import OtherIcon from "../assets/bus-stop.svg";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
const FILTERS = ["All", "Recent", "Most Upvoted", "Mine"];
const categoryIcons = {
  park: ParkIcon,
  "bus stop": BusStopIcon,
  sidewalk: SidewalkIcon,
  schoolyard: SchoolYardIcon,
  plaza: PlazaIcon,
  other: OtherIcon,
};

function NominationCard({ nomination, onClick }) {
  const trees = calculateTreeCount(nomination.upvoteCount);
  const temp = calculateTempReduction(trees);
  const shade = calculateShadeArea(trees);

  return (
    <div
      onClick={() => onClick(nomination)}
      style={{
        background: "white",
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        border: "1px solid #b5d48a",
        marginBottom: "12px",
        display: "flex",
        gap: "12px",
        padding: "12px",
      }}
    >
      <img
        src={categoryIcons[nomination.category?.toLowerCase()] || OtherIcon}
        alt={nomination.category}
        width="32"
        height="32"
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            background: "#344e41",
            color: "white",
            fontSize: "10px",
            padding: "2px 6px",
            borderRadius: "12px",
            fontWeight: "600",
          }}
        >
          {nomination.status || "pending"}
        </span>

        <h3
          style={{
            fontSize: "13px",
            fontWeight: "700",
            color: "#1a3a0f",
            margin: "4px 0 2px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {nomination.title}
        </h3>

        <div
          style={{
            display: "flex",
            gap: "8px",
            fontSize: "11px",
            color: "#3a7d1e",
          }}
        >
          <span>🌡 -{temp}°C</span>
          <span>🌲 {trees}</span>
          <span>☁ {shade}m²</span>
          <span>▲ {nomination.upvoteCount}</span>
        </div>
      </div>
    </div>
  );
}

function NominationsPanel() {
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isOpen, setIsOpen] = useState(false);
  const startY = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/nominations`)
      .then((res) => res.json())
      .then((data) => {
        setNominations(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load nominations.");
        setLoading(false);
      });
  }, []);

  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const endY = e.changedTouches[0].clientY;
    const diff = startY.current - endY;
    if (diff > 50) setIsOpen(true); // swiped up
    if (diff < -50) setIsOpen(false); // swiped down
  };

  const handleMouseDown = (e) => {
    startY.current = e.clientY;
  };

  const handleMouseUp = (e) => {
    const diff = startY.current - e.clientY;
    if (diff > 30) setIsOpen(true);
    if (diff < -30) setIsOpen(false);
  };

  const filtered = nominations
    .filter((n) => {
      if (activeFilter === "Mine") return n.nominatorEmail === user?.email;
      return true;
    })
    .sort((a, b) => {
      if (activeFilter === "Most Upvoted") return b.upvoteCount - a.upvoteCount;
      if (activeFilter === "Recent")
        return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "60%",
        background: "#f5f0eb",
        borderRadius: "20px 20px 0 0",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
        transform: isOpen ? "translateY(0)" : "translateY(calc(100% - 36px))",
        transition: "transform 0.3s ease",
      }}
    >
      {/* drag handle — always visible */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          padding: "10px 0 8px",
          display: "flex",
          justifyContent: "center",
          cursor: "grab",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "40px",
            height: "4px",
            background: "#aaa",
            borderRadius: "4px",
          }}
        />
      </div>

      {/* header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "4px 16px 12px",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#1a3a0f",
            margin: 0,
          }}
        >
          Nominations
        </h2>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* filter tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "0 16px 12px",
          overflowX: "auto",
        }}
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: "5px 14px",
              borderRadius: "20px",
              border: "1.5px solid #344e41",
              background: activeFilter === f ? "#344e41" : "white",
              color: activeFilter === f ? "white" : "#344e41",
              fontWeight: "600",
              fontSize: "12px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
        {loading && <p style={{ color: "#666" }}>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p style={{ color: "#666" }}>No nominations found.</p>
        )}
        {filtered.map((n) => (
          <NominationCard key={n._id} nomination={n} onClick={() => {}} />
        ))}
      </div>
    </div>
  );
}

export default NominationsPanel;
