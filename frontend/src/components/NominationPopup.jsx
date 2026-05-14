import { useNavigate } from "react-router-dom";
import { calculateTreeCount, calculateTempReduction, calculateShadeArea } from "../utils/shadeCalc";

function formatImpactSummary(upvotes) {
  const trees = calculateTreeCount(upvotes);
  const temp = calculateTempReduction(trees);
  const shade = calculateShadeArea(trees);
  return `${temp}°C • ${trees} ${trees === 1 ? "tree" : "trees"} • ${shade} m²`;
}

function NominationPopup({ nomination, onClose }) {
  const navigate = useNavigate();

  if (!nomination) return null;

  const descriptionExcerpt = nomination.description?.length > 80
    ? nomination.description.slice(0, 80) + "..."
    : nomination.description;

  return (
    <>
      {/* invisible backdrop to close popup */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1099,
        }}
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

        {/* title */}
        <p style={{
          fontSize: "15px",
          fontWeight: "700",
          color: "#1a3a0f",
          margin: "0 0 6px",
          paddingRight: "20px",
          lineHeight: "1.3",
        }}>
          {nomination.title}
        </p>

        {/* upvote count */}
        <p style={{
          fontSize: "13px",
          fontWeight: "600",
          color: "#344e41",
          margin: "0 0 8px",
        }}>
          {nomination.upvoteCount} upvotes
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
          Estimated impact: {formatImpactSummary(nomination.upvoteCount)}
        </p>

        {/* view details button */}
        <button
          onClick={() => navigate(`/nomination/${nomination._id}/impact`)}
          style={{
            width: "100%",
            padding: "10px",
            background: "#344e41",
            color: "white",
            border: "none",
            borderRadius: "2px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          View Details
        </button>
      </div>
    </>
  );
}

export default NominationPopup;
