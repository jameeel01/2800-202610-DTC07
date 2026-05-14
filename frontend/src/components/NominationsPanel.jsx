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

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
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

function NominationDetail({ nomination, onBack, onUpvote }) {
  const trees = calculateTreeCount(nomination.upvoteCount);
  const temp = calculateTempReduction(trees);
  const shade = calculateShadeArea(trees);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
      {/* back button */}
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "#344e41",
          fontWeight: "600",
          fontSize: "13px",
          cursor: "pointer",
          padding: "0 0 12px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        ← Back
      </button>

      {/* title and status */}
      <div style={{ marginBottom: "12px" }}>
        <span
          style={{
            background: "#344e41",
            color: "white",
            fontSize: "10px",
            padding: "2px 8px",
            borderRadius: "12px",
            fontWeight: "600",
          }}
        >
          {nomination.status || "pending"}
        </span>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#1a3a0f",
            margin: "6px 0 2px",
          }}
        >
          {nomination.title}
        </h2>
        <p style={{ fontSize: "12px", color: "#588157", margin: 0 }}>
          {nomination.location?.streetAddress}
        </p>
      </div>

      {/* description */}
      <div
        style={{
          background: "white",
          borderRadius: "10px",
          padding: "12px",
          marginBottom: "12px",
          border: "1px solid #b5d48a",
        }}
      >
        <p
          style={{
            fontSize: "13px",
            color: "#344e41",
            margin: 0,
            lineHeight: "1.5",
          }}
        >
          {nomination.description}
        </p>
      </div>

      {/* impact stats */}
      <div
        style={{
          background: "#c8d8b0",
          borderRadius: "10px",
          padding: "12px",
          marginBottom: "12px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "#1a3a0f",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "8px",
          }}
        >
          🌳 Estimated Impact
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "8px",
          }}
        >
          {[
            { label: "Avg Temp Reduction", value: `-${temp}°C` },
            { label: "Trees Planted", value: `${trees}` },
            { label: "Shade Coverage", value: `${shade}m²` },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                background: "white",
                borderRadius: "8px",
                padding: "8px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#344e41",
                  margin: 0,
                }}
              >
                {value}
              </p>
              <p style={{ fontSize: "10px", color: "#588157", margin: "2px 0 0" }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* nominated by */}
      <p style={{ fontSize: "12px", color: "#888", marginBottom: "16px" }}>
        Nominated by {nomination.nominatorName}
      </p>

      {/* upvote button */}
      <button
        onClick={() => onUpvote(nomination._id)}
        style={{
          width: "100%",
          padding: "14px",
          background: nomination.hasUpvoted ? "white" : "#344e41",
          color: nomination.hasUpvoted ? "#344e41" : "white",
          border: nomination.hasUpvoted ? "2px solid #344e41" : "none",
          borderRadius: "12px",
          fontSize: "15px",
          fontWeight: "700",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        {nomination.hasUpvoted ? " Upvoted" : " Upvote"} · {nomination.upvoteCount}
      </button>
    </div>
  );
}

function NominationsPanel() {
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNomination, setSelectedNomination] = useState(null);
  const startY = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

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

  const handleUpvote = async (id) => {
    if (!token) {
      alert("You must be logged in to upvote.");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/nominations/${id}/upvote`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) return;

      // update upvote count and hasUpvoted in local state
      setNominations((prev) =>
        prev.map((n) =>
          n._id === id
            ? { ...n, upvoteCount: data.upvoteCount, hasUpvoted: data.hasUpvoted }
            : n
        )
      );

      // update selected nomination if open
      setSelectedNomination((prev) =>
        prev && prev._id === id
          ? { ...prev, upvoteCount: data.upvoteCount, hasUpvoted: data.hasUpvoted }
          : prev
      );
    } catch (err) {
      console.error("Upvote error:", err);
    }
  };

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
          {selectedNomination ? "Nomination Detail" : "Nominations"}
        </h2>
      </div>

      {/* filter tabs — only show on list view */}
      {!selectedNomination && (
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
      )}

      {/* list or detail view */}
      {selectedNomination ? (
        <NominationDetail
          nomination={selectedNomination}
          onBack={() => setSelectedNomination(null)}
          onUpvote={handleUpvote}
        />
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
          {loading && <p style={{ color: "#666" }}>Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p style={{ color: "#666" }}>No nominations found.</p>
          )}
          {filtered.map((n) => (
            <NominationCard
              key={n._id}
              nomination={n}
              onClick={setSelectedNomination}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default NominationsPanel;