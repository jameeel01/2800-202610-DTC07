function NominateButton({ setIsPinDropMode }) {
  return (
    <button
      onClick={() => setIsPinDropMode(true)}
      style={{
        position: "absolute",
        bottom: "24px",
        right: "16px",
        zIndex: 1000,
        padding: "10px 18px",
        background: "#1a1a2e",
        color: "#9ca3af",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      Nominate +
    </button>
  );
}

export default NominateButton;
