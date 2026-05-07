import { useState } from "react";

function BottomSheet({ isOpen, onClose, pin }) {
  const [locationName, setLocationName] = useState("");
  const [reason, setReason] = useState("");

  if (!isOpen || !pin) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-1000">
      <div className="bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] px-5 pt-3 pb-6">
        {/* drag handle bar */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        {/* header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📍</span>
          <h2 className="text-[17px] font-bold text-[#1a3a0f] m-0">
            Nominate This Spot
          </h2>
        </div>

        {/* location name input */}
        <div className="mb-4">
          <label className="block text-[13px] font-semibold text-[#1a3a0f] mb-1">
            Location Name
          </label>
          <input
            type="text"
            placeholder="e.g. Riley Park Corner"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-[#b5d48a] bg-white text-sm text-[#555] outline-none"
          />
        </div>

        {/* reason textarea */}
        <div className="mb-4">
          <label className="block text-[13px] font-semibold text-[#1a3a0f] mb-1">
            Why does this area need shade?
          </label>
          <textarea
            placeholder="Describe the need for shade..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-[#b5d48a] bg-white text-sm text-[#555] outline-none h-24 resize-none"
          />
        </div>

        {/* buttons */}
        <div className="flex flex-col gap-3">
          <button className="w-full py-3 bg-[#344e41] text-white rounded-xl text-[15px] font-bold">
            Submit Nomination
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-white text-[#344e41] border-2 border-[#344e41] rounded-xl text-[15px] font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default BottomSheet;
