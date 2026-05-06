function PinDropBanner({ isPinDropMode, setIsPinDropMode }) {
  if (!isPinDropMode) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        background: "#111827",
        padding: "10px 20px",
        borderRadius: "8px",
        display: "flex",
        gap: "16px",
        alignItems: "center",
        fontWeight: "bold",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      <span style={{ color: "#9ca3af" }}>
        Tap the map to place your pin. To confirm, click on the marker.
      </span>
      <button
        onClick={() => setIsPinDropMode(false)}
        style={{
          background: "none",
          color: "#9ca3af",
          border: "none",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default PinDropBanner;
