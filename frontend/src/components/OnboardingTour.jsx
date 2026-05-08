import { useState, useEffect } from "react";

const TOUR_KEY = "shaded_tour_complete";

const steps = [
  {
    title: "Welcome to Shaded 🌳",
    description:
      "Help Vancouver stay cool. Nominate spots in your neighbourhood where a new tree could make a real difference.",
    position: "center",
  },
  {
    title: "Explore the Map",
    description:
      "This map shows community nominations across Vancouver. Tap any pin to see its details, shade impact, and upvote spots you support.",
    position: "top-center",
  },
  {
    title: "Drop a Nomination Pin",
    description:
      "See a spot that bakes in the sun? Tap \"Nominate +\" to enter pin-drop mode, then tap anywhere on the map to place your pin.",
    position: "bottom-right",
    highlight: "nominate",
  },
  {
    title: "See the Impact",
    description:
      "Every nomination shows an estimated shade coverage, temperature reduction, and CO2 absorption — powered by City of Vancouver tree data.",
    position: "center",
  },
];

// Card positions for each step
const cardStyle = (position) => {
  const base = {
    position: "absolute",
    zIndex: 2000,
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    maxWidth: "300px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    fontFamily: "sans-serif",
  };
  if (position === "center") {
    return {
      ...base,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }
  if (position === "top-center") {
    return {
      ...base,
      top: "80px",
      left: "50%",
      transform: "translateX(-50%)",
    };
  }
  if (position === "bottom-right") {
    return {
      ...base,
      bottom: "80px",
      right: "20px",
    };
  }
  return base;
};

export function OnboardingTour({ onRestartRef }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show tour automatically on first visit
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) setVisible(true);

    // Expose restart function so parent can trigger it (e.g. from ? button)
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
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleFinish = () => {
    localStorage.setItem(TOUR_KEY, "true");
    setVisible(false);
  };

  const handleSkip = () => {
    localStorage.setItem(TOUR_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <>
      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 1999,
        }}
      />

      {/* Tour card */}
      <div style={cardStyle(current.position)}>
        {/* Step counter */}
        <div
          style={{
            fontSize: "12px",
            color: "#6b7280",
            marginBottom: "8px",
            fontWeight: "600",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Step {step + 1} of {steps.length}
        </div>

        {/* Dot progress */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: i === step ? "#2d6a0f" : "#d1d5db",
                transition: "background 0.2s",
              }}
            />
          ))}
        </div>

        {/* Title */}
        <h2
          style={{
            margin: "0 0 10px",
            fontSize: "18px",
            fontWeight: "700",
            color: "#1a3a0f",
          }}
        >
          {current.title}
        </h2>

        {/* Description */}
        <p
          style={{
            margin: "0 0 20px",
            fontSize: "14px",
            color: "#4b5563",
            lineHeight: "1.6",
          }}
        >
          {current.description}
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {step > 0 && (
            <button
              onClick={handleBack}
              style={{
                padding: "9px 16px",
                background: "none",
                border: "1.5px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
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
              padding: "10px 16px",
              background: "#2d6a0f",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            {isLast ? "Got it!" : "Next"}
          </button>

          {!isLast && (
            <button
              onClick={handleSkip}
              style={{
                padding: "9px 16px",
                background: "none",
                border: "none",
                fontSize: "13px",
                color: "#9ca3af",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// Small restart button shown on the map at all times
export function TourRestartButton({ onRestart }) {
  return (
    <button
      onClick={onRestart}
      title="Restart tour"
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        zIndex: 1000,
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: "white",
        border: "1.5px solid #d1d5db",
        color: "#2d6a0f",
        fontSize: "16px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      ?
    </button>
  );
}
