import { useState, useEffect } from "react";

function BottomSheet({ isOpen, onClose, pin, onSubmit, onRemove }) {
  const [locationName, setLocationName] = useState("");
  const [reason, setReason] = useState("");

  // reverse geocode the pin coordinates to auto-fill location name
  useEffect(() => {
    if (!pin) return;

    const fetchAddress = async () => {
      // reset fields when a new pin is placed
      setLocationName("");
      setReason("");

      try {
        // call Nominatim API with the pin's coordinates
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${pin.latlng.lat}&lon=${pin.latlng.lng}&format=json`,
          {
            headers: {
              "Accept-Language": "en",
            },
          },
        );
        const data = await res.json();

        // pre-fill the location name field with the returned address
        if (data && data.display_name) {
          setLocationName(data.display_name);
        }
      } catch (err) {
        // log error if geocode fails
        console.error("Reverse geocode failed:", err);
      }
    };

    fetchAddress();
  }, [pin]);

  if (!isOpen || !pin) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-1000 md:hidden">
      <div className="bg-[#dad7cd] rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] px-5 pt-3 pb-6">
        {/* drag handle bar */}
        <div className="w-10 h-1 bg-gray-400 rounded-full mx-auto mb-4" />

        {/* pin label */}
        <h2 className="text-[16px] font-bold text-[#1a3a0f] underline break-words mb-1">
          {pin.label}
        </h2>

        {/* location pinned indicator */}
        <div className="flex items-center gap-1.5 mb-5">
          <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
            <path
              d="M6 0C2.686 0 0 2.686 0 6c0 4.5 6 10 6 10s6-5.5 6-10C12 2.686 9.314 0 6 0z"
              fill="#17C0E3"
            />
            <circle cx="6" cy="6" r="2" fill="white" />
          </svg>
          <span className="text-[13px] text-[#3a7d1e] font-medium">
            Location pinned
          </span>
        </div>

        {/* location name input */}
        <div className="mb-4">
          <label className="block text-[13px] font-semibold text-[#1a3a0f] mb-1.5">
            Location Name
          </label>
          <input
            type="text"
            placeholder="e.g. Riley Park Corner"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border-[1.5px] border-[#b5d48a] bg-white text-sm text-[#555] outline-none"
          />
        </div>

        {/* reason textarea */}
        <div className="mb-4">
          <label className="block text-[13px] font-semibold text-[#1a3a0f] mb-1.5">
            Why does this area need shade?
          </label>
          <textarea
            placeholder="Describe the need for shade..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border-[1.5px] border-[#b5d48a] bg-white text-sm text-[#555] outline-none h-24 resize-none"
          />
        </div>

        {/* buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => onSubmit({ pin, locationName, reason })}
            className="w-full py-3 bg-[#344e41] text-white rounded-xl text-[15px] font-bold"
          >
            Submit Nomination
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#3a5a40] text-white rounded-xl text-[15px] font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => onRemove(pin.id)}
            className="w-full py-3 bg-white text-[#8b1a1a] border-2 border-[#e8a0a0] rounded-xl text-[15px] font-semibold"
          >
            Remove Pin
          </button>
        </div>
      </div>
    </div>
  );
}

export default BottomSheet;
