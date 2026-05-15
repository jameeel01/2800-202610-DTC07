import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { calculateTreeCount, calculateTempReduction, calculateShadeArea } from "../utils/shadeCalc";

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

function formatImpactSummary(upvotes) {
  const trees = calculateTreeCount(upvotes);
  const temp = calculateTempReduction(trees);
  const shade = calculateShadeArea(trees);
  return `${temp}°C • ${trees} ${trees === 1 ? "tree" : "trees"} • ${shade} m²`;
}

function NominationPopup({ nomination, onClose, onUpvoteSuccess }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [upvoteCount, setUpvoteCount] = useState(nomination.upvoteCount);
  const [hasUpvoted, setHasUpvoted] = useState(
    Array.isArray(nomination.upvoterIds) && user
      ? nomination.upvoterIds.includes(user.id)
      : false
  );
  const [upvoting, setUpvoting] = useState(false);
  const isOwner = user && String(nomination.nominatorId) === String(user.id);
  const isLoggedIn = !!localStorage.getItem("token");

  if (!nomination) return null;

  const descriptionExcerpt = nomination.description?.length > 80
    ? nomination.description.slice(0, 80) + "..."
    : nomination.description;

  const handleUpvote = async () => {
    // redirect to login if not logged in
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    setUpvoting(true);
    try {
      const res = await fetch(`${API_URL}/api/nominations/${nomination._id}/upvote`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUpvoteCount(data.upvoteCount ?? upvoteCount + (hasUpvoted ? -1 : 1));
        setHasUpvoted((prev) => !prev);
        if (onUpvoteSuccess) onUpvoteSuccess(nomination._id, data.upvoteCount);
      }
    } catch (err) {
      // silently fail
    } finally {
      setUpvoting(false);
    }
  };

  return (
    <>
      {/* invisible backdrop to close popup */}
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, zIndex: 1099 }}
      />

      {/* popup card */}
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1100,
          background: "white",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          padding: "16px",
          width: "280px",
          fontFamily: "sans-serif",
          borderRadius: "12px",
        }}
      >
        {/* close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "12px",
            background: "none",
            border: "none",
            fontSize: "16px",
            color: "#9ca3af",
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          x
        </button>

        {/* your nomination badge */}
        {isOwner && (
          <span
            style={{
              display: "inline-block",
              background: "#344e41",
              color: "white",
              fontSize: "10px",
              fontWeight: "700",
              padding: "2px 8px",
              borderRadius: "12px",
              marginBottom: "6px",
            }}
          >
            Your Nomination
          </span>
        )}

        {/* title */}
        <p style={{
          fontSize: "15px",
          fontWeight: "700",
          color: "#1a3a0f",
          margin: "0 0 4px",
          paddingRight: "20px",
          lineHeight: "1.3",
        }}>
          {nomination.title}
        </p>

        {/* nominated by */}
        <p style={{
          fontSize: "11px",
          color: "#9ca3af",
          margin: "0 0 8px",
        }}>
          Nominated by {isOwner ? "you" : nomination.nominatorName}
        </p>

        {/* description excerpt */}
        {descriptionExcerpt && (
          <p style={{
            fontSize: "13px",
            color: "#6b7280",
            margin: "0 0 10px",
            lineHeight: "1.5",
          }}>
            {descriptionExcerpt}
          </p>
        )}

        {/* estimated impact */}
        <p style={{
          fontSize: "12px",
          fontWeight: "600",
          color: "#344e41",
          margin: "0 0 14px",
        }}>
          Estimated impact: {formatImpactSummary(upvoteCount)}
        </p>

        {/* upvote + view details buttons */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleUpvote}
            disabled={upvoting}
            style={{
              flex: 1,
              padding: "10px",
              background: hasUpvoted ? "#344e41" : "white",
              color: hasUpvoted ? "white" : "#344e41",
              border: "1px solid #344e41",
              borderRadius: "2px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              opacity: upvoting ? 0.6 : 1,
            }}
          >
            {isLoggedIn
              ? `${upvoteCount} ${hasUpvoted ? "Upvoted" : "Upvotes"}`
              : "Log in to upvote"}
          </button>

          <button
            onClick={() => navigate(`/nomination/${nomination._id}/impact`)}
            style={{
              flex: 1,
              padding: "10px",
              background: "#f0f7f0",
              color: "#344e41",
              border: "1px solid #344e41",
              borderRadius: "2px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </>
  );
}

export default NominationPopup;