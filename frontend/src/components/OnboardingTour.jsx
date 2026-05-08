import { useState, useEffect } from "react";

const TOUR_KEY = "shaded_tour_complete";

const steps = [
  {
    id: "welcome",
    title: "First time here?",
    description:
      "Shaded lets Vancouver residents nominate locations for new trees. Your nominations help the city decide where shade is needed most.",
    position: "center",
    arrow: null,
    overlay: "dark",
  },
  {
    id: "map",
    title: "Nominations on the map",
    description:
      "Each pin marks a community nomination. Tap a pin to see the location, its upvote count, and how much shade a tree there would provide.",
    position: "top-center",
    arrow: "down",
    overlay: "light",
  },
  {
    id: "nominate",
    title: "Nominate a spot",
    description:
      "Tap Nominate, then tap anywhere on the map to drop a pin. You can describe why the spot needs shade before submitting.",
    position: "above-nominate",
    arrow: "down",
    overlay: "light",
  },
  {
    id: "impact",
    title: "See the shade impact",
    description:
      "Every nomination shows an estimated shade coverage area, surface temperature reduction, and annual CO2 absorbed. Figures are sourced from City of Vancouver tree data.",
    position: "center",
    arrow: null,
    overlay: "dark",
  },
];

const overlayStyle = (type) => ({
  position: "absolute",
  inset: 0,
  background: type === "dark" ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.35)",
  zIndex: 1999,
  transition: "background 0.25s ease",
});

const getCardPosition = (position) => {
  const base = {
    position: "absolute",
    zIndex: 2000,
    background: "#ffffff",
    borderRadius: "2px",
    padding: "20px",
    width: "272px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
    border: "1px solid #e5e7eb",
    fontFamily: "sans-serif",
  };

  if (position === "center") {
    return { ...base, top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }
  if (position === "top-center") {
    return { ...base, top: "72px", left: "50%", transform: "translateX(-50%)" };
  }
  if (position === "above-nominate") {
    return { ...base, bottom: "68px", right: "20px" };
  }
  return base;
};

// CSS triangle arrow
function Arrow({ direction, align = "center" }) {
  if (!direction) return null;

  const isDown = direction === "down";
  const style = {
    position: "absolute",
    width: 0,
    height: 0,
    borderLeft: "8px solid transparent",
    borderRight: "8px solid transparent",
    ...(isDown
      ? { borderTop: "8px solid #ffffff", bottom: "-8px" }
      : { borderBottom: "8px solid #ffffff", top: "-8px" }),
    ...(align === "center"
      ? { left: "50%", transform: "translateX(-50%)" }
      : { right: "28px" }),
  };

  // Border arrow (grey outline matching card border)
  const borderStyle = {
    ...style,
    ...(isDown
      ? { borderTop: "9px solid #e5e7eb", bottom: "-10px" }
      : { borderBottom: "9px solid #e5e7eb", top: "-10px" }),
    zIndex: -1,
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={borderStyle} />
      <div style={style} />
    </div>
  );
}

export function OnboardingTour({ onRestartRef }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) setVisible(true);
    if (onRestartRef) {
      onRestartRef.current = () => {
        setStep(0);
        setVisible(true);
      };
    }
  }, []);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const dismiss = () => {
    localStorage.setItem(TOUR_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const isAboveNominate = current.position === "above-nominate";

  return (
    <>
      {/* Overlay */}
      <div style={overlayStyle(current.overlay)} onClick={dismiss} />

      {/* Card */}
      <div style={getCardPosition(current.position)}>
        {/* Arrow above card (for top-center) */}
        {current.arrow === "up" && <Arrow direction="up" />}

        {/* Step counter row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          {/* Dot progress */}
          <div style={{ display: "flex", gap: "5px" }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? "18px" : "6px",
                  height: "6px",
                  borderRadius: "0",
                  background: i === step ? "#344e41" : "#d1d5db",
                  transition: "width 0.2s ease, background 0.2s ease",
                }}
              />
            ))}
          </div>

          {/* Step count text */}
          <span
            style={{
              fontSize: "11px",
              color: "#9ca3af",
              letterSpacing: "0.04em",
              fontWeight: "500",
            }}
          >
            {step + 1} / {steps.length}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            margin: "0 0 8px",
            fontSize: "15px",
            fontWeight: "700",
            color: "#111827",
            lineHeight: "1.3",
          }}
        >
          {current.title}
        </h3>

        {/* Description */}
        <p
          style={{
            margin: "0 0 18px",
            fontSize: "13px",
            color: "#6b7280",
            lineHeight: "1.65",
          }}
        >
          {current.description}
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {step > 0 && (
            <button
              onClick={handleBack}
              style={{
                padding: "8px 14px",
                background: "none",
                border: "1px solid #e5e7eb",
                borderRadius: "2px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                cursor: "pointer",
              }}
            >
              Back
            </button>
          )}

          <button
            onClick={handleNext}
            style={{
              flex: 1,
              padding: "9px 14px",
              background: "#344e41",
              color: "#ffffff",
              border: "none",
              borderRadius: "7px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              letterSpacing: "0.01em",
            }}
          >
            {isLast ? "Get started" : "Next"}
          </button>

          {!isLast && (
            <button
              onClick={dismiss}
              style={{
                padding: "9px 10px",
                background: "none",
                border: "none",
                fontSize: "12px",
                color: "#9ca3af",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Skip
            </button>
          )}
        </div>

        {/* Arrow below card */}
        {current.arrow === "down" && (
          <Arrow
            direction="down"
            align={isAboveNominate ? "right" : "center"}
          />
        )}
      </div>
    </>
  );
}

// Restart button — bottom-left of map, always visible
export function TourRestartButton({ onRestart }) {
  return (
    <button
      onClick={onRestart}
      title="Replay tour"
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        zIndex: 1000,
        width: "32px",
        height: "32px",
        borderRadius: "2px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        color: "#344e41",
        fontSize: "14px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
      }}
    >
      ?
    </button>
  );
}
