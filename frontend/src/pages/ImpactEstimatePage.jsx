import { useNavigate, useParams } from "react-router-dom";
import StatCard from "../components/StatCard";
import StarRating from "../components/StarRating";
import {
  calculateTreeCount,
  calculateShadeArea,
  calculateTempReduction,
  calculateCO2,
  calculateCommunityStars,
} from "../utils/shadeCalc";

// Mock nomination to be replaced GET /api/nominations/:id
const MOCK_NOMINATION = {
  title: "Riley Park",
  upvoteCount: 42,
};

function ImpactEstimatePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock nomination to be replaced GET /api/nominations/:id
  const nomination = MOCK_NOMINATION;

  const trees = calculateTreeCount(nomination.upvoteCount);
  const temp = calculateTempReduction(trees);
  const shade = calculateShadeArea(trees);
  const co2 = calculateCO2(trees);
  const stars = calculateCommunityStars(nomination.upvoteCount);

  return (
    <div className="min-h-screen bg-[#f0f7f0] px-4 py-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 mb-6"
      >
        Back
      </button>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-900">Impact Estimate</h1>
      <p className="text-sm text-[#2d5a27] mt-1 mb-8">
        {nomination.title} with {trees} {trees === 1 ? "tree" : "trees"}
      </p>

      {/* Stat cards */}
      <div className="flex flex-col gap-4">
        <StatCard
          value={`${temp}°C`}
          label="Temperature Reduction"
          subtext="Within 50m radius"
        />
        <StatCard
          value={`${shade} m²`}
          label="Shade Coverage"
          subtext="During peak sun"
        />
        <StatCard
          value={`${co2} kg/yr`}
          label="CO2 Absorption"
          subtext="Annual carbon absorbed"
        />
        <StatCard label="Community Impact" subtext="Upvotes & proximity">
          <StarRating stars={stars} />
        </StatCard>
      </div>

      {/* Source */}
      <p className="text-xs text-gray-400 mt-8 text-center">
        Source: City of Vancouver Urban Forestry Strategy
      </p>
    </div>
  );
}

export default ImpactEstimatePage;
